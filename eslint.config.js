const js = require("@eslint/js");
const globals = require("globals");

module.exports = [
  {
    // Third-party MD5 library, not authored as part of this project
    ignores: ["node_modules/**", "public/js/md5.js"],
  },
  js.configs.recommended,
  {
    files: ["**/*.js"],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "script",
      globals: {
        ...globals.browser,
      },
    },
  },
  {
    files: ["eslint.config.js", "jest.config.js"],
    languageOptions: {
      sourceType: "commonjs",
      globals: {
        ...globals.node,
      },
    },
  },
  {
    // Jest test files run in Node.js (with jsdom for the front-end unit tests)
    files: ["tests/**/*.js"],
    languageOptions: {
      sourceType: "commonjs",
      globals: {
        ...globals.node,
        ...globals.jest,
        ...globals.browser,
      },
    },
  },
];
