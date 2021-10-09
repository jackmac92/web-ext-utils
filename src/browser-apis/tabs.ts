import browser from 'webextension-polyfill';
import type { Tabs } from "webextension-polyfill";
import { oneShotEventHandler } from "../helpers/index";

/**
 * @category tabs
 */
export const getActiveTab = (): Promise<Tabs.Tab> =>
  browser.windows
    .getCurrent()
    .then(({ id }) => browser.tabs.query({ active: true, windowId: id }))
    .then((tabs: Tabs.Tab[]) => {
      if (!tabs[0]) {
        throw new Error("Could not find an active tab");
      }
      return tabs[0];
    });

/**
 * @category tabs
 */
export const tryGetActiveTab = (): Promise<Tabs.Tab | undefined> =>
  browser.windows
    .getCurrent()
    .then(({ id }) => browser.tabs.query({ active: true, windowId: id }))
    .then(tabs => {
      return tabs[0];
    });

/**
 * @category tabs
 */
const getAllTabs = () => browser.tabs.query({});

/**
 * @category tabs
 */
export const withEachTab = async <T>(
  cb: (a: Tabs.Tab) => Promise<T>
): Promise<T[]> =>
  getAllTabs()
    .then(tabs => tabs.map(t => cb(t)))
    .then(promises => Promise.all(promises));

/**
 * @category tabs
 */
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
