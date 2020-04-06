import { browser, Tabs } from "webextension-polyfill-ts"; // eslint-disable-line no-unused-vars
import { nanoid } from "nanoid";
import { getActiveTab } from "../browser-apis/tabs";
import { oneShotEventHandler } from "./misc";

const addSelfCleaningBannerToTab = (message: string) => async (
  tabId: number
) => {
  const bannerUuid = nanoid();
  const waitForResponse = oneShotEventHandler(
    browser.runtime.onMessage,
    async (message, _sender, _sendResponse) =>
      message.type === "USER_CONFIRM" && message.uuid === bannerUuid
  );

  await browser.tabs.executeScript(tabId, {
    file: browser.runtime.getURL(
      "/browser-ext-utilz-content-scripts/displayBanner.ts"
    )
  });
  const m = JSON.stringify(message);
  const bid = JSON.stringify(bannerUuid);
  await browser.tabs
    .executeScript(tabId, {
      code: `injectBannerOnPage(${m}, ${bid})`
    })
    .then((resultOnEveryPage: any[]) => {
      // The below is entirely usesless, the real way relies on oneShotEventHandler, but I wanted to test out returns
      console.log("Received response from page!", resultOnEveryPage);
    });
  return waitForResponse;
};

export const addBannerToActiveTab = (activityName = "Unknown Task") => {
  const addBannerToTab = addSelfCleaningBannerToTab(activityName);
  getActiveTab().then((tab: Tabs.Tab) => addBannerToTab(tab.id));
  return new Promise(resolve =>
    browser.tabs.onActivated.addListener(({ tabId }) =>
      resolve(addBannerToTab(tabId))
    )
  );
};
