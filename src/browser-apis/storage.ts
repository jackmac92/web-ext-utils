import { browser } from 'webextension-polyfill-ts'

export const getStorage = (storageType: string) => <T, V>(
  storageKey: T,
  defaultValue: null | V = null
): Promise<V> =>
  new Promise((resolve, reject) => {
    browser.storage[storageType].get([storageKey], result => {
      const r = result[storageKey]
      if (defaultValue === null && !r) {
        reject(result)
      }
      resolve(r || defaultValue)
    })
  })

export const setStorage = storageType => (storageKey, value) =>
  new Promise(resolve => {
    browser.storage[storageType].set({ [storageKey]: value }, result =>
      resolve(result)
    )
  })

// const id: <A>(a: A) => A = a => 'string'

export const getLocalStorage: <T, V>(a: T) => Promise<V> = getStorage('local')
export const getLocalStorageBoolean: (a: any) => Promise<boolean> = getStorage(
  'local'
)

// const _getLocalStorage = getStorage('local')
// export const getLocalStorage: <T>(a: T) => Promise<T> = key => {
//   return _getLocalStorage(key)
// }
export const setLocalStorage = setStorage('local')
