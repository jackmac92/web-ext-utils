import browser, { Tabs } from "webextension-polyfill"; // eslint-disable-line no-unused-vars
import { nanoid } from "nanoid";
import { getActiveTab } from "../browser-apis/tabs";
import { oneShotEventHandler } from "./misc";

/** @hidden */
const addSelfCleaningBannerToTab = (message: string) => async (
  tabId: number
) => {
  const bannerUuid = nanoid();
  const waitForResponse = oneShotEventHandler(
    browser.runtime.onMessage,
    async (message, _) => message.uuid === bannerUuid
  );

  const m = JSON.stringify(message);
  const bid = JSON.stringify(bannerUuid);
  await browser.tabs
    .executeScript(tabId, {
      code: `\
    console.log('Begin inserting banner');
    const banner = document.createElement('div');
    banner.id = 'browixir-banner';
    banner.style.width = '100vw';
    banner.style.height = '8vw';
    banner.style.position = 'absolute';
    banner.style.top = 0;
    banner.style.left = 0;
    banner.style.background = 'green';
    banner.style.color = 'yellow';
    banner.style.display = 'flex';
    banner.style['align-items'] = 'center';
    banner.style['justify-content'] = 'center';

    const copyContainer = document.createElement('span');
    copyContainer.innerText = ${m};
    const confirmButton = document.createElement('button');
    confirmButton.innerText = 'Yes!';
    confirmButton.addEventListener('click', () => chrome.runtime.sendMessage({ type: 'USER_CONFIRM', uuid: ${bid} }));
    const rejectButton = document.createElement('button');
    rejectButton.innerText = 'Nope';
    rejectButton.addEventListener('click', () => chrome.runtime.sendMessage({ type: 'USER_REJECT', uuid: ${bid} }));
    banner.appendChild(copyContainer);
    banner.appendChild(confirmButton);
    banner.appendChild(rejectButton);
    console.log('Attaching banner to document');
    document.body.appendChild(banner);
    console.log('Attached banner to DOM');
    return "hello world";`
      // document.addEventListener('visibilitychange', (_e) => {
      //     if (document.hidden) {
      //       console.log('Removing banner from DOM')
      //       document.body.removeChild(banner)
      //     }
      // });
    })
    .then((resultOnEveryPage: any[]) => {
      // The below is entirely usesless, the real way relies on oneShotEventHandler, but I wanted to test out returns
      console.log("Received response from page!", resultOnEveryPage);
    });
  return waitForResponse;
};

/**
 * @category helpers
 */
export const addBannerToActiveTab = (
  activityName = "Unknown Task"
): Promise<boolean> => {
  const addBannerToTab = addSelfCleaningBannerToTab(activityName);
  return getActiveTab()
    .then((tab: Tabs.Tab) => addBannerToTab(tab.id as number))
    .then((...eventArgs: unknown[]) =>
      // @ts-expect-error
      eventArgs[0].type === "USER_CONFIRM"
    );
};
