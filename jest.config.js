/** @typedef {import('ts-jest')} */
/** @type {import('@jest/types').Config.InitialOptions} */
const config = {
  preset: "ts-jest",
  testEnvironment: "node",
  testRegex: "(^src.*/__tests__/.*|(\\.|/)(test|spec))\\.(jsx?|tsx?)$",
  testPathIgnorePatterns: ["/node_modules/", "/pkg/", "/lib/"],
  setupFiles: ["jest-webextension-mock", "./jest-global-setup.ts"],
  globals: {
    // window needs to be set as global so that webextension-polyfill-ts exports the full object
    // https://github.com/Lusito/webextension-polyfill-ts/blob/develop/src/generated/index.ts#L169
    // HACK this will likely break something at some point in the future
    window: true,
    "ts-jest": {}
  },
  transform: {
    "^.+\\.tsx?$": "ts-jest"
  }
};

module.exports = config;
