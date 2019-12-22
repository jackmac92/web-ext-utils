import { browser } from 'webextension-polyfill-ts'

type validationHandler = (el: any) => boolean
type locateElementHandler = () => any

const MAX_ATTEMPTS = 20

export const elementLocated = (
  el: any,
  validator: validationHandler = () => true
) => {
  if (el === undefined) {
    return false
  }

  if (validator !== undefined) {
    return validator(el)
  }

  return true
}

export const scrapeInfo = (
  item: string,
  locator: locateElementHandler,
  validator: validationHandler
) => {
  const comPort = browser.runtime.connect()
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
