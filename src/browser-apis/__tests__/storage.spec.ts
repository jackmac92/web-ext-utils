import { mocked } from "ts-jest/utils";
import { browser } from "webextension-polyfill-ts";
import { getLocalStorage, getSyncStorage } from "../storage";

const mockBrowser = mocked(browser, true);

describe("storage API helper", () => {
  it("local storage access should call the underlying API", () => {
    expect(() => getLocalStorage("testkey")).not.toThrowError();
    expect(mockBrowser.storage.local.get).toHaveBeenCalledWith(["testkey"]);
  });
  it("sync storage access should call the underlying API", () => {
    expect(() => getSyncStorage("testkey")).not.toThrowError();
    expect(mockBrowser.storage.sync.get).toHaveBeenCalledWith(["testkey"]);
  });
});
