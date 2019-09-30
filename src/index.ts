import { browser } from 'webextension-polyfill-ts'

type validationHandler = (el: any) => boolean
type locateElementHandler = () => any

const MAX_ATTEMPTS = 20

const comPort = browser.runtime.connect()

const elementLocated = (el: any, validator: validationHandler = () => true) => {
  if (el === undefined) {
    return false
  }

  if (validator !== undefined) {
    return validator(el)
  }

  return true
}

type scrapeHandler = () => void

export const scrapeInfo = (
  item: string,
  locator: locateElementHandler,
  validator: validationHandler
) => {
  return new Promise((resolve, reject) => {
    let element: any
    let attempts = 0
    const waitForEl = setInterval(() => {
      if (elementLocated(element, validator)) {
        clearInterval(waitForEl)
        resolve({
          action: item,
          data: element
        })
      } else if (attempts < MAX_ATTEMPTS) {
        attempts += 1
        element = locator()
      } else {
        reject('Failing to locate element')
      }
    }, 1000)
  }).then(res => {
    comPort.postMessage({ type: 'SCRAPE_INFO', payload: res })
  })
}

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

comPort.onMessage.addListener(m => {
  console.log(`Inject received msg ${m}`)
  // get branchInfo, open locally, allow for changes to be saved to git patch and sent over to author
})

const awaitTabClosing = async (targetTabId, msTimeout = 60000) =>
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

export default awaitTabClosing
