// Integration tests for the PHP API (api/*.php).
//
// These send real HTTP requests to the PHP endpoints, which talk to a real
// MySQL database. In GitHub Actions the workflow starts MySQL, loads
// tests/integration/schema.sql, and serves api/ with PHP's built-in server.
// Node.js is only used to run the tests, not the application.
//
// Locally: start the API yourself and set API_URL, e.g.
//   php -S 127.0.0.1:8000 -t api
//   API_URL=http://127.0.0.1:8000 npm run test:integration

const crypto = require("crypto");

const API_URL = process.env.API_URL || "http://127.0.0.1:8000";

const TEST_LOGIN = "testuser";
const TEST_PASSWORD_MD5 = crypto
  .createHash("md5")
  .update("testpass")
  .digest("hex");

async function post(endpoint, payload) {
  const response = await fetch(`${API_URL}/${endpoint}`, {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=UTF-8" },
    body: JSON.stringify(payload),
  });
  const text = await response.text();

  let json;
  try {
    json = JSON.parse(text);
  } catch {
    throw new Error(
      `${endpoint} did not return valid JSON. Raw response:\n${JSON.stringify(text)}`
    );
  }
  return { response, json };
}

async function loginAsTestUser() {
  const { json } = await post("Login.php", {
    login: TEST_LOGIN,
    password: TEST_PASSWORD_MD5,
  });
  return json.id;
}

describe("Login.php", () => {
  test("valid credentials return the user's id and name", async () => {
    const { response, json } = await post("Login.php", {
      login: TEST_LOGIN,
      password: TEST_PASSWORD_MD5,
    });

    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toMatch(/application\/json/);
    expect(json).toEqual({
      id: expect.any(Number),
      firstName: "Test",
      lastName: "User",
      error: "",
    });
    expect(json.id).toBeGreaterThan(0);
  });

  test("invalid credentials return id 0 and an error", async () => {
    const { response, json } = await post("Login.php", {
      login: TEST_LOGIN,
      password: "wrong-password",
    });

    expect(response.status).toBe(200);
    expect(json).toEqual({
      id: 0,
      firstName: "",
      lastName: "",
      error: "No Records Found",
    });
  });
});

describe("SearchColors.php", () => {
  test("returns matching colors as a JSON array", async () => {
    const userId = await loginAsTestUser();
    const { response, json } = await post("SearchColors.php", {
      search: "red",
      userId,
    });

    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toMatch(/application\/json/);
    expect(json.error).toBe("");
    expect(Array.isArray(json.results)).toBe(true);
    expect(json.results).toEqual(expect.arrayContaining(["Red", "Dark Red"]));
    expect(json.results).not.toContain("Blue");
  });

  test("returns an error when nothing matches", async () => {
    const userId = await loginAsTestUser();
    const { json } = await post("SearchColors.php", {
      search: "no-such-color-xyz",
      userId,
    });

    expect(json.error).toBe("No Records Found");
  });

  test("only returns colors that belong to the given user", async () => {
    const { json } = await post("SearchColors.php", {
      search: "red",
      userId: 9999,
    });

    expect(json.error).toBe("No Records Found");
  });
});

describe("AddColor.php", () => {
  test("adds a color that can then be found with SearchColors.php", async () => {
    const userId = await loginAsTestUser();
    const newColor = `Test Color ${Date.now()}`;

    const add = await post("AddColor.php", { color: newColor, userId });
    expect(add.response.status).toBe(200);
    expect(add.response.headers.get("content-type")).toMatch(
      /application\/json/
    );
    expect(add.json).toEqual({ error: "" });

    const search = await post("SearchColors.php", { search: newColor, userId });
    expect(search.json.error).toBe("");
    expect(search.json.results).toEqual([newColor]);
  });
});

describe("JSON structure with special characters", () => {
  test("a color name containing quotes still returns valid JSON", async () => {
    const userId = await loginAsTestUser();
    const trickyColor = `Robin's "Egg" Blue ${Date.now()}`;

    const add = await post("AddColor.php", { color: trickyColor, userId });
    expect(add.json).toEqual({ error: "" });

    const search = await post("SearchColors.php", {
      search: trickyColor,
      userId,
    });
    expect(search.json).toEqual({ results: [trickyColor], error: "" });
  });
});
