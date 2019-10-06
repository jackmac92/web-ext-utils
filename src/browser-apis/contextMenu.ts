import { browser } from 'webextension-polyfill-ts'

const defaultCreateMenuOptions = {
  menuOptions: {},
  singleUse: false
}

export const createContextMenu = (
  menuTitle,
  handler,
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
      const clickListener = (clickedItemInfo, tab: any) => {
        if (clickedItemInfo.menuItemId === itemId) {
          handler(clickedItemInfo, tab)
          if (options.singleUse) {
            browser.contextMenus.remove(itemId)
            browser.contextMenus.onClicked.removeListener(clickListener)
          }
        }
      }
      browser.contextMenus.onClicked.addListener(clickListener)
    }
  )
  // browser.contextMenus.create({
  //   id: "separator-1",
  //   type: "separator",
  //   contexts: ["all"]
  // })
}
