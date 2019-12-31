import { browser } from 'webextension-polyfill-ts' // eslint-disable-line no-unused-vars
// https://developer.chrome.com/extensions/browsingData

export const clearUserDataFromOneWeek = () => {
  var millisecondsPerWeek = 1000 * 60 * 60 * 24 * 7
  var oneWeekAgo = new Date().getTime() - millisecondsPerWeek
  browser.browsingData.remove(
    {
      since: oneWeekAgo
    },
    {
      cache: true,
      cookies: true,
      downloads: true,
      formData: true,
      history: true,
      indexedDB: true,
      localStorage: true,
      pluginData: true,
      passwords: true,
      serviceWorkers: true
    }
  )
}
