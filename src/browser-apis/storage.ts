import { browser } from 'webextension-polyfill-ts'

export const getStorage = (storageType: string) => <T, V>(
  storageKey: T,
  defaultValue: null | V = null
): Promise<V> =>
  new Promise((resolve, reject) => {
    browser.storage[storageType].get([storageKey]).then(result => {
      const r = result[storageKey]
      if (defaultValue === null && !r) {
        reject(result)
      }
      resolve(r || defaultValue)
    })
  })

export const setStorage = storageType => (storageKey, value) =>
  new Promise(resolve => {
    browser.storage[storageType]
      .set({ [storageKey]: value })
      .then(result => resolve(result))
  })

export const getLocalStorage: <T, V>(
  a: T,
  defaultValue?: V
) => Promise<V> = getStorage('local')

export const getLocalStorageBoolean: (
  a: string,
  defaultValue?: boolean
) => Promise<boolean> = (a, defaultValue = false) =>
  getLocalStorage(a, defaultValue)

export const setLocalStorage: <V>(
  k: string,
  v: V
) => Promise<unknown> = setStorage('local')
