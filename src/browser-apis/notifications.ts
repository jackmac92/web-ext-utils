import { browser } from 'webextension-polyfill-ts'

const logProperty = (el?: any) => console.log(el)


// SHOULDDO investigate if this is a valid way to find icon, got errors before`
// const manifestIcons = browser.runtime.getManifest()['icons']
// const biggestIconSz = Object.values(manifestIcons)
//   .map((j: string) => parseInt(j, 10))
//   .sort()
//   .reverse()[0]

// const biggestIcon = browser.runtime.getURL(manifestIcons[biggestIconSz])

let notificationIconURL: URL = new URL(
  `data:image/png;base64,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`
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
