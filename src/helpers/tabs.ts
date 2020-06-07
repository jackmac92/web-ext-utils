import { browser, Tabs } from "webextension-polyfill-ts"; // eslint-disable-line no-unused-vars
import { JsonValue } from "type-fest"; // eslint-disable-line no-unused-vars
import { getActiveTab } from "../browser-apis/tabs";

export const awaitTabClosing = async (targetTabId: number, msTimeout = 60000) =>
  new Promise((resolve, reject) => {
    const timeout = setTimeout(() => reject("timeout"), msTimeout);
    const tmpHandler = (tabId: number, _info: Tabs.OnRemovedRemoveInfoType) => {
      if (tabId === targetTabId) {
        clearTimeout(timeout);
        browser.tabs.onRemoved.removeListener(tmpHandler);
        resolve();
      }
    };
    browser.tabs.onRemoved.addListener(tmpHandler);
  });

export const sendMessageToActiveTab = (msg: JsonValue) =>
  getActiveTab().then(({ id }) => browser.tabs.sendMessage(id as number, msg));
