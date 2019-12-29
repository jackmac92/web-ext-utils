// https://developer.chrome.com/extensions/browsingData

export const clearUserDataFromOneWeek = () => {
  var callback = function() {
    // Do something clever here once data has been removed.
  }

  var millisecondsPerWeek = 1000 * 60 * 60 * 24 * 7
  var oneWeekAgo = new Date().getTime() - millisecondsPerWeek
  chrome.browsingData.remove(
    {
      since: oneWeekAgo
    },
    {
      appcache: true,
      cache: true,
      cookies: true,
      downloads: true,
      fileSystems: true,
      formData: true,
      history: true,
      indexedDB: true,
      localStorage: true,
      pluginData: true,
      passwords: true,
      serviceWorkers: true,
      webSQL: true
    },
    callback
  )
}
