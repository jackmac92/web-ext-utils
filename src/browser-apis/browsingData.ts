import browser from 'webextension-polyfill' // eslint-disable-line no-unused-vars
// https://developer.chrome.com/extensions/browsingData

/**
 * @category browsingData
 */
export const clearUserDataFromOneWeek = () => {
  const millisecondsPerWeek = 1000 * 60 * 60 * 24 * 7
  const oneWeekAgo = new Date().getTime() - millisecondsPerWeek
  return browser.browsingData.remove(
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
