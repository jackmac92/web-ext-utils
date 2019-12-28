import { browser } from 'webextension-polyfill-ts'

export const getActiveTab = (): Promise<any> =>
  browser.windows
    .getCurrent()
    .then(({ id }) => browser.tabs.query({ active: true, windowId: id }))
    .then(tabs => {
      if (!tabs[0]) {
        throw new Error('Could not find an active tab')
      }
      return tabs[0]
    })

const getALlTabs = () => browser.tabs.query({})

export const withEachTab = async (cb): Promise<any[]> => {
  const tabs = await getALlTabs()
  return Promise.all(tabs.map(cb))
}

export const reloadTab = (tabId: number) => browser.tabs.reload(tabId)
