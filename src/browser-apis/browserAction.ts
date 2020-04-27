import { browser, Tabs } from "webextension-polyfill-ts";
import { getLocalStorageBoolean, setLocalStorage } from "./storage";

const SINGLETON_LOCAL_STORAGE_KEY = "browserActionInUse";
const LOCAL_STORAGE_KEY = "browserActionStatus";

const getActiveState = () => getLocalStorageBoolean(LOCAL_STORAGE_KEY, false);
const setActiveState = (val: boolean) =>
  setLocalStorage(LOCAL_STORAGE_KEY, val);

// COULDDO check if below arg is rgba and pass it differently (this assumes you know it needs to be a hex code)
export const setBadgeColor = (color: string) =>
  browser.browserAction.setBadgeBackgroundColor({ color });

const matchIconToStatus = async () => {
  const current = await getActiveState();
  const color = current ? "#AA3" : "#F00";
  const badgeText = current ? "on" : "off";
  return Promise.all([
    browser.browserAction.setBadgeBackgroundColor({ color }),
    browser.browserAction.setBadgeText({ text: badgeText })
  ]);
};

const toggleActiveState = async () => {
  const current = await getActiveState();
  const newState = !current;
  await setActiveState(newState);
  matchIconToStatus();
  return newState;
};

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
