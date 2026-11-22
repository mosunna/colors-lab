/**
 * @jest-environment jsdom
 */

// Front-end unit tests for public/js/code.js.
//
// code.js is a plain browser script (no modules), so each test loads it into
// the jsdom window exactly the way the browser does with a <script> tag.
// XMLHttpRequest is replaced with a fake so no network or server is needed.

const fs = require("fs");
const path = require("path");

const CODE_JS = fs.readFileSync(
  path.join(__dirname, "..", "..", "public", "js", "code.js"),
  "utf8"
);

// Minimal fake XMLHttpRequest that records what the app sends and lets the
// test play back a server response.
class FakeXHR {
  constructor() {
    this.headers = {};
    this.readyState = 0;
    this.status = 0;
    this.responseText = "";
    FakeXHR.instances.push(this);
  }

  open(method, url, async) {
    this.method = method;
    this.url = url;
    this.async = async;
  }

  setRequestHeader(name, value) {
    this.headers[name] = value;
  }

  send(body) {
    this.body = body;
  }

  respond(status, json) {
    this.readyState = 4;
    this.status = status;
    this.responseText = JSON.stringify(json);
    this.onreadystatechange.call(this);
  }
}
FakeXHR.instances = [];

function lastRequest() {
  return FakeXHR.instances[FakeXHR.instances.length - 1];
}

function loadColorPage() {
  document.body.innerHTML = `
    <span id="userName"></span>
    <input type="text" id="searchText">
    <span id="colorSearchResult"></span>
    <p id="colorList"></p>
    <input type="text" id="colorText">
    <span id="colorAddResult"></span>`;
}

function loadLoginPage() {
  document.body.innerHTML = `
    <input type="text" id="loginName">
    <input type="password" id="loginPassword">
    <span id="loginResult"></span>`;
}

beforeEach(() => {
  FakeXHR.instances = [];
  window.XMLHttpRequest = FakeXHR;
  // Load code.js fresh into the page for every test (like a page load).
  window.eval(CODE_JS.replace(/^(const|let) /gm, "var "));
});

describe("addColor()", () => {
  test("sends the new color and the logged-in user's id as JSON", () => {
    loadColorPage();
    document.cookie = "firstName=Jane,lastName=Doe,userId=7";
    window.readCookie();

    document.getElementById("colorText").value = "Teal";
    window.addColor();

    const xhr = lastRequest();
    expect(xhr.method).toBe("POST");
    expect(xhr.url).toMatch(/\/AddColor\.php$/);
    expect(xhr.headers["Content-type"]).toMatch(/application\/json/);
    expect(JSON.parse(xhr.body)).toEqual({ color: "Teal", userId: 7 });
  });

  test("shows a confirmation message when the server responds", () => {
    loadColorPage();
    document.getElementById("colorText").value = "Teal";
    window.addColor();

    lastRequest().respond(200, { error: "" });

    expect(document.getElementById("colorAddResult").innerHTML).toBe(
      "Color has been added"
    );
  });
});

describe("searchColor()", () => {
  test("sends the search text and user id", () => {
    loadColorPage();
    document.cookie = "firstName=Jane,lastName=Doe,userId=7";
    window.readCookie();

    document.getElementById("searchText").value = "re";
    window.searchColor();

    expect(lastRequest().url).toMatch(/\/SearchColors\.php$/);
    expect(JSON.parse(lastRequest().body)).toEqual({ search: "re", userId: 7 });
  });

  test("formats results as one color per line", () => {
    loadColorPage();
    window.searchColor();

    lastRequest().respond(200, {
      results: ["Red", "Dark Red", "Orange Red"],
      error: "",
    });

    const list = document.getElementById("colorList");
    expect(list.querySelectorAll("br")).toHaveLength(2);
    expect(list.textContent.split(/\r?\n/)).toEqual([
      "Red",
      "Dark Red",
      "Orange Red",
    ]);
    expect(document.getElementById("colorSearchResult").innerHTML).toBe(
      "Color(s) has been retrieved"
    );
  });

  test("shows a single result without a line break", () => {
    loadColorPage();
    window.searchColor();

    lastRequest().respond(200, { results: ["Blue"], error: "" });

    const list = document.getElementById("colorList");
    expect(list.innerHTML).toBe("Blue");
  });
});

describe("doLogin()", () => {
  test("sends the login and password typed into the form", () => {
    loadLoginPage();
    document.getElementById("loginName").value = "jdoe";
    document.getElementById("loginPassword").value = "secret";

    window.doLogin();

    expect(lastRequest().url).toMatch(/\/Login\.php$/);
    expect(JSON.parse(lastRequest().body)).toEqual({
      login: "jdoe",
      password: "secret",
    });
  });

  test("shows an error for an incorrect username/password", () => {
    loadLoginPage();
    window.doLogin();

    lastRequest().respond(200, {
      id: 0,
      firstName: "",
      lastName: "",
      error: "No Records Found",
    });

    expect(document.getElementById("loginResult").innerHTML).toBe(
      "User/Password combination incorrect"
    );
  });
});

describe("readCookie()", () => {
  test("reads the user id saved in the login cookie", () => {
    loadColorPage();
    document.cookie = "firstName=Jane,lastName=Doe,userId=42";

    window.readCookie();
    window.searchColor();

    expect(JSON.parse(lastRequest().body).userId).toBe(42);
  });
});
