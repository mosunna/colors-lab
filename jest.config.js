module.exports = {
  // Unit tests opt into jsdom with a docblock; integration tests run in Node.
  testEnvironment: "node",
  testMatch: ["<rootDir>/tests/**/*.test.js"],
};
