import { browser } from 'webextension-polyfill-ts'
import { getActiveTab } from '../browser-apis/tabs'

const addSelfCleaningBannerToTab = (message: string) => async (
  tabId: number
) => {
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

    banner.innerText = '${message}'
    document.body.appendChild(banner)
    document.addEventListener('visibilitychange', (_e) => {
        if (document.hidden) {
          document.body.removeChild(banner)
        }
    });
  `
  })
}

export const addBannerToActiveTab = (activityName = 'Unknown Task') => {
  const addBannerToTab = addSelfCleaningBannerToTab(activityName)
  getActiveTab().then((tab: any) => addBannerToTab(tab.id))
  const listener = ({ tabId }: any) => addBannerToTab(tabId)
  browser.tabs.onActivated.addListener(listener)
}
