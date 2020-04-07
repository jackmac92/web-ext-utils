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
    async (message, _sender, _sendResponse) => message.uuid === bannerUuid
  );

  const m = JSON.stringify(message);
  const bid = JSON.stringify(bannerUuid);
  await browser.tabs
    .executeScript(tabId, {
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
    copyContainer.innerText = ${m}
    const confirmButton = document.createElement('button')
    confirmButton.innerText = 'Yes!'
    confirmButton.onclick = () => chrome.runtime.sendMessage({ type: 'USER_CONFIRM', uuid: ${bid} })
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
    })
    .then((resultOnEveryPage: any[]) => {
      // The below is entirely usesless, the real way relies on oneShotEventHandler, but I wanted to test out returns
      console.log("Received response from page!", resultOnEveryPage);
    });
  return waitForResponse;
};

export const addBannerToActiveTab = (
  activityName = "Unknown Task"
): Promise<boolean> => {
  const addBannerToTab = addSelfCleaningBannerToTab(activityName);
  getActiveTab().then((tab: Tabs.Tab) => addBannerToTab(tab.id));
  return new Promise(resolve =>
    browser.tabs.onActivated.addListener(({ tabId }) =>
      addBannerToTab(tabId)
        .then((...eventArgs) => {
          const message: any = eventArgs[0];
          if (message.type === "USER_CONFIRM") return true;
          return false;
        })
        .then((res: boolean) => resolve(res))
    )
  );
};
