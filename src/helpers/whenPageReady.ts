type scrapeHandler = () => void

export const whenPageReady = (action: scrapeHandler, urlSelector = /./) => {
  const readyStateCheckInterval = setInterval(() => {
    if (document.readyState === 'complete') {
      clearInterval(readyStateCheckInterval)
      if (window.location.href.match(urlSelector)) {
        action()
      }
    }
  }, 10)
}
