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

/**
 * @category contextMenu
 */
export const createContextMenu = (
  menuTitle: string,
  handler: (
    removeContextMenuCb: () => void,
    clickInfo: Menus.OnClickData,
    tab?: Tabs.Tab
  ) => void,
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
      const cleanupContextMenu = () => {
        browser.contextMenus.remove(itemId)
        browser.contextMenus.onClicked.removeListener(clickListener)
      }
      const clickListener: clickHandler = (e, tab) => {
        if (e.menuItemId === itemId) {
          handler(cleanupContextMenu, e, tab)
          if (options.singleUse) {
            cleanupContextMenu()
          }
        }
      }
      browser.contextMenus.onClicked.addListener(clickListener)
    }
  )
}
