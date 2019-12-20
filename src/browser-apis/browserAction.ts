import { getLocalStorageBoolean, setLocalStorage } from './storage'

const SINGLETON_LOCAL_STORAGE_KEY = 'browserActionInUse'
const LOCAL_STORAGE_KEY = 'browserActionStatus'

const getActiveState = () => getLocalStorageBoolean(LOCAL_STORAGE_KEY)
const setActiveState = val => setLocalStorage(LOCAL_STORAGE_KEY, val)

// COULDDO check if below arg is rgba and pass it differently (this assumes you know it needs to be a hex code)
export const setBadgeColor = color =>
  new Promise(r => {
    chrome.browserAction.setBadgeBackgroundColor({ color }, r)
  })

const matchIconColorToStatus = async () => {
  const color = (await getActiveState()) ? '#AA3' : '#F00'
  return await setBadgeColor(color)
}

const toggleActiveState = async () => {
  const current = await getActiveState()
  const newState = !current
  await setActiveState(newState)
  matchIconColorToStatus()
  return newState
}

matchIconColorToStatus()

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
  return () => {
    setLocalStorage(SINGLETON_LOCAL_STORAGE_KEY, false)
    chrome.browserAction.onClicked.removeListener(thisBrowserActionListener)
  }
}
