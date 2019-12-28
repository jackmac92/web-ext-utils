import { browser } from 'webextension-polyfill-ts'

const logProperty = (el?: any) => console.log(el)

interface NotificationReq {
  readonly action?: string
}

// SHOULDDO investigate if this is a valid way to find icon, got errors before`
// const manifestIcons = browser.runtime.getManifest()['icons']
// const biggestIconSz = Object.values(manifestIcons)
//   .map((j: string) => parseInt(j, 10))
//   .sort()
//   .reverse()[0]

// const biggestIcon = browser.runtime.getURL(manifestIcons[biggestIconSz])

let notificationIconURL: URL = new URL(
  'https://freeiconshop.com/wp-content/uploads/edd/notification-outline.png'
)

export const updateNotificationIconPath = (v: string) => {
  notificationIconURL = new URL(browser.runtime.getURL(v))
}

export const updateNotificationIconURL = (v: URL) => {
  notificationIconURL = v
}

export const textNotification = (title, subTitle, action = logProperty) => {
  browser.notifications
    .create({
      title,
      iconUrl: notificationIconURL.toString(),
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
