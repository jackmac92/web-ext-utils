import { browser } from 'webextension-polyfill-ts'

const logProperty = (el?: any) => console.log(el)

interface NotificationReq {
  readonly action?: string
}

const manifestIcons = browser.runtime.getManifest()['icons']
const biggestIconSz = Object.values(manifestIcons)
  .map((j: string) => parseInt(j, 10))
  .sort()
  .reverse()[0]

const biggestIcon = browser.runtime.getURL(manifestIcons[biggestIconSz])

let notificationIconURL = biggestIcon

export const updateNotificationIconPath = (v: string, fromInternal = true) => {
  // COULDDO check if image at URL is valid before setting
  if (fromInternal) {
    notificationIconURL = browser.runtime.getURL(v)
  } else {
    notificationIconURL = v
  }
}

export const textNotification = (title, subTitle, action = logProperty) => {
  browser.notifications
    .create({
      title,
      iconUrl: notificationIconURL,
      message: subTitle,
      type: 'basic'
    })
    .then(createId => {
      const handler = (id: string) => {
        if (id === createId) {
          action()
          browser.notifications.clear(id)
          browser.notifications.onClicked.removeListener(handler)
        }
      }
      browser.notifications.onClicked.addListener(handler)
    })
}
// SHOULDDO click here to switch to tab notificatoin
