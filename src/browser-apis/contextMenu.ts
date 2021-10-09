import { Promisable } from 'type-fest';
import browser, { Tabs, Menus } from 'webextension-polyfill' // eslint-disable-line no-unused-vars


interface ctxMenuOpts {
  menuOptions: Menus.CreateCreatePropertiesType,
  singleUse?: boolean
}
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
  ) => Promisable<void>,
  options: ctxMenuOpts = defaultCreateMenuOptions
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
          Promise.resolve(handler(cleanupContextMenu, e, tab)).then(() => {
            if (options.singleUse) {
              cleanupContextMenu()
            }
          })
        }
      }
      browser.contextMenus.onClicked.addListener(clickListener)
    }
  )
}
