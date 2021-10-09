/* global jest */
import { mocked } from "ts-jest/utils";
import browser from "webextension-polyfill";
jest.mock("webextension-polyfill");

global.browser = mocked(browser, true);

// @ts-expect-error
browser.permissions = {};
browser.permissions.getAll = jest.fn(() =>
  Promise.resolve({
    permissions: ["storage"],
  })
);

// @ts-expect-error
browser.runtime = {};
// @ts-expect-error
browser.runtime.getManifest = jest.fn(() => ({ icons: [] }));
browser.runtime.getURL = jest.fn();
