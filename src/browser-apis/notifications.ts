import { browser } from 'webextension-polyfill-ts'

const logProperty = (el: any) => console.log(el)

interface NotificationReq {
  readonly action?: string
}

export const textNotification = (title, subTitle, action = logProperty) => {
  browser.notifications
    .create({
      title,
      iconUrl: browser.runtime.getURL('icons/icon-small.png'),
      message: subTitle,
      type: 'basic'
    })
    .then(createId => {
      const handler = (id: string) => {
        if (id === createId) {
          action(null)
          browser.notifications.clear(id)
          browser.notifications.onClicked.removeListener(handler)
        }
      }
      browser.notifications.onClicked.addListener(handler)
    })
}

export const __notifier = (m: NotificationReq, action = logProperty) => {
  let title: string
  let subTitle: string
  switch (m.action) {
    case 'screenshotHandler':
      title = 'Found Screenshot for test'
      subTitle = 'Click to download'
      break
    default:
      title = 'Found something'
      subTitle = 'Click to do stuff'
  }
  browser.notifications
    .create({
      title,
      iconUrl: browser.runtime.getURL('icons/icon-small.png'),
      message: subTitle,
      type: 'basic'
    })
    .then(createId => {
      const handler = (id: string) => {
        if (id === createId) {
          action(m)
          browser.notifications.clear(id)
          browser.notifications.onClicked.removeListener(handler)
        }
      }
      browser.notifications.onClicked.addListener(handler)
    })
}
