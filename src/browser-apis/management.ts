import { browser, Management } from 'webextension-polyfill-ts' // eslint-disable-line no-unused-vars

export const listExtensions = async () => {
  const allInstalledItems = await browser.management.getAll()
  return allInstalledItems.filter(z => z.type === 'extension')
}

export const disableExtensions = (extList: Management.ExtensionInfo[]) =>
  Promise.all(
    extList.map(({ id }) => {
      browser.management.setEnabled(id, false)
    })
  )
export const enableExtensions = (extList: Management.ExtensionInfo[]) =>
  Promise.all(
    extList.map(({ id }) => {
      browser.management.setEnabled(id, true)
    })
  )
