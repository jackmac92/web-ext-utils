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
  // SHOULDDO move the below code to a separate file to be loaded in, probably need to figure out web_accessible_resources, in order to not use chrome.runtime (use browser.runtime)
  await browser.tabs.executeScript(tabId, {
    code: `\
    const banner = document.createElement('div')
    banner.id = 'browixir-banner'
    banner.style.width = '100vw'
    banner.style.height = '8vw'
    banner.style.position = 'absolute'
    banner.style.top = 0
    banner.style.left = 0
    banner.style.background = 'green'
    banner.style.color = 'yellow'
    banner.style.display = 'flex'
    banner.style['align-items'] = 'center'
    banner.style['justify-content'] = 'center'

    const copyContainer = document.createElement('span')
    copyContainer.innerText = '${message}'
    const confirmButton = document.createElement('button')
    confirmButton.innerText = 'Yes!'
    confirmButton.onclick = () => chrome.runtime.sendMessage({ type: 'USER_CONFIRM', uuid: "${bannerUuid}" })
    const rejectButton = document.createElement('button')
    rejectButton.innerText = 'Nope'
    banner.appendChild(copyContainer)
    banner.appendChild(confirmButton)
    banner.appendChild(rejectButton)
    document.body.appendChild(banner)
    document.addEventListener('visibilitychange', (_e) => {
        if (document.hidden) {
          document.body.removeChild(banner)
        }
    });
  `
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
