import { getLocalStorageBoolean, setLocalStorage } from './storage'

const SINGLETON_LOCAL_STORAGE_KEY = 'browserActionInUse'
const LOCAL_STORAGE_KEY = 'browserActionStatus'

const getActiveState = () => getLocalStorageBoolean(LOCAL_STORAGE_KEY, false)
const setActiveState = val => setLocalStorage(LOCAL_STORAGE_KEY, val)

// COULDDO check if below arg is rgba and pass it differently (this assumes you know it needs to be a hex code)
export const setBadgeColor = color =>
  new Promise(r => {
    chrome.browserAction.setBadgeBackgroundColor({ color }, r)
  })

const matchIconToStatus = async () => {
  const current = await getActiveState()
  const color = current ? '#AA3' : '#F00'
  const badgeText = current ? 'on' : 'off'
  return Promise.all([
    new Promise(r => {
      chrome.browserAction.setBadgeBackgroundColor({ color }, r)
    }),
    new Promise(r => {
      chrome.browserAction.setBadgeText({ text: badgeText }, r)
    })
  ])
}

const toggleActiveState = async () => {
  const current = await getActiveState()
  const newState = !current
  await setActiveState(newState)
  matchIconToStatus()
  return newState
}

export const toggleEventListenerViaBrowserActionFactory = async (
  eventObject,
  handler
) => {
  if (await getLocalStorageBoolean(SINGLETON_LOCAL_STORAGE_KEY)) {
    throw Error('Only one active action allowed at a time')
  }
  await setLocalStorage(SINGLETON_LOCAL_STORAGE_KEY, true)

  const thisBrowserActionListener = async _tab => {
    const isNowRunning = await toggleActiveState()
    if (isNowRunning) {
      eventObject.addListener(handler)
    } else {
      eventObject.removeListener(handler)
    }
  }
  chrome.browserAction.onClicked.addListener(thisBrowserActionListener)
  matchIconToStatus()
  return () => {
    setLocalStorage(SINGLETON_LOCAL_STORAGE_KEY, false)
    chrome.browserAction.onClicked.removeListener(thisBrowserActionListener)
  }
}
