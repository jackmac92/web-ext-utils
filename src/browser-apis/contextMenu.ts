import { browser, Tabs, Menus } from 'webextension-polyfill-ts' // eslint-disable-line no-unused-vars

const defaultCreateMenuOptions = {
  menuOptions: {},
  singleUse: false
}

// browser.contextMenus.create({
//   id: "separator-1",
//   type: "separator",
//   contexts: ["all"]
// })

type clickHandler = (c: Menus.OnClickData, t: Tabs.Tab | undefined) => void

export const createContextMenu = (
  menuTitle: string,
  handler: (i: Menus.OnClickData, t?: Tabs.Tab) => void,
  options = defaultCreateMenuOptions
) => {
  const itemId = `${Math.floor(Math.random() * 1000000000)}`
  return browser.contextMenus.create(
    {
      contexts: ['all'],
      ...options.menuOptions,
      title: menuTitle,
      id: itemId
    },
    () => {
      const clickListener: clickHandler = (e, tab) => {
        if (e.menuItemId === itemId) {
          handler(e, tab)
          if (options.singleUse) {
            browser.contextMenus.remove(itemId)
            browser.contextMenus.onClicked.removeListener(clickListener)
          }
        }
      }
      browser.contextMenus.onClicked.addListener(clickListener)
    }
  )
}
