import { browser, Tabs } from "webextension-polyfill-ts"; // eslint-disable-line no-unused-vars
import { oneShotEventHandler } from "../helpers";

export const getActiveTab = (): Promise<Tabs.Tab> =>
  browser.windows
    .getCurrent()
    .then(({ id }) => browser.tabs.query({ active: true, windowId: id }))
    .then(tabs => {
      if (!tabs[0]) {
        throw new Error("Could not find an active tab");
      }
      return tabs[0];
    });

export const tryGetActiveTab = (): Promise<Tabs.Tab | undefined> =>
  browser.windows
    .getCurrent()
    .then(({ id }) => browser.tabs.query({ active: true, windowId: id }))
    .then(tabs => {
      return tabs[0];
    });

const getAllTabs = () => browser.tabs.query({});

export const withEachTab = async <T>(
  cb: (a: Tabs.Tab) => Promise<T>
): Promise<T[]> =>
  getAllTabs()
    .then(tabs => tabs.map(t => cb(t)))
    .then(promises => Promise.all(promises));

export const reloadTab = async (tabId: number): Promise<unknown> =>
  browser.tabs.reload(tabId).then(() =>
    oneShotEventHandler(
      browser.tabs.onUpdated,
      async (eventTabId, { status }, _tab) => {
        if (tabId !== eventTabId) return false;
        if (status === "complete") return true;
        return false;
      }
    )
  );
