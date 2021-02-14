import { browser, Tabs } from "webextension-polyfill-ts"; // eslint-disable-line no-unused-vars
import { getLocalStorageBoolean, setLocalStorage } from "./storage";

/** @hidden */
const SINGLETON_LOCAL_STORAGE_KEY = "browserActionInUse";

/** @hidden */
const LOCAL_STORAGE_KEY = "browserActionStatus";

/** @hidden */
const getActiveState = () => getLocalStorageBoolean(LOCAL_STORAGE_KEY, false);
/** @hidden */
const setActiveState = (val: boolean) =>
  setLocalStorage(LOCAL_STORAGE_KEY, val);

// COULDDO check if below arg is rgba and pass it differently (this assumes you know it needs to be a hex code)
/** @hidden */
export const setBadgeColor = (color: string) =>
  browser.browserAction.setBadgeBackgroundColor({ color });

/** @hidden */
const matchIconToStatus = async () => {
  const isNowActive = await getActiveState();
  const color = isNowActive ? "#AA3" : "#F00";
  const badgeText = isNowActive ? "on" : "off";
  return Promise.all([
    browser.browserAction.setBadgeBackgroundColor({ color }),
    browser.browserAction.setBadgeText({ text: badgeText })
  ]).then(() => {});
};

/**
 * @hidden
 */
const toggleActiveState = async () => {
  const current = await getActiveState();
  const newState = !current;
  await setActiveState(newState);
  matchIconToStatus();
  return newState;
};

/**
 * @category high-level
 */
export const toggleEventListenerViaBrowserActionFactory = async (
  eventObject: any,
  handler: (...args: any) => any
) => {
  if (await getLocalStorageBoolean(SINGLETON_LOCAL_STORAGE_KEY)) {
    throw Error("Only one active action allowed at a time");
  }
  await setLocalStorage(SINGLETON_LOCAL_STORAGE_KEY, true);

  const thisBrowserActionListener = async (_tab: Tabs.Tab) => {
    const isNowRunning = await toggleActiveState();
    if (isNowRunning) {
      eventObject.addListener(handler);
    } else {
      eventObject.removeListener(handler);
    }
  };
  browser.browserAction.onClicked.addListener(thisBrowserActionListener);
  matchIconToStatus();
  return () => {
    setLocalStorage(SINGLETON_LOCAL_STORAGE_KEY, false);
    browser.browserAction.onClicked.removeListener(thisBrowserActionListener);
  };
};
