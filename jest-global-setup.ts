/* global jest */
import { mocked } from "ts-jest/utils";
import { browser } from "webextension-polyfill-ts";
jest.mock("webextension-polyfill-ts");

// @ts-expect-error
global.browser = mocked(browser, true);

// @ts-expect-error
browser.permissions = {};
browser.permissions.getAll = jest.fn(() =>
  Promise.resolve({
    permissions: ["storage"]
  })
);
