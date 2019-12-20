import { browser } from 'webextension-polyfill-ts'
import { getActiveTab } from '../browser-apis/tabs'

export const awaitTabClosing = async (targetTabId, msTimeout = 60000) =>
  new Promise((resolve, reject) => {
    const timeout = setTimeout(() => reject('timeout'), msTimeout)
    const tmpHandler = (tabId, _info) => {
      if (tabId === targetTabId) {
        clearTimeout(timeout)
        browser.tabs.onRemoved.removeListener(tmpHandler)
        resolve()
      }
    }
    browser.tabs.onRemoved.addListener(tmpHandler)
  })

export const sendMessageToActiveTab = msg =>
  getActiveTab().then(({ id }) => browser.tabs.sendMessage(id, msg))
