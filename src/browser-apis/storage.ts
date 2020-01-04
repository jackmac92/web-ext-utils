import { JsonValue } from 'type-fest' // eslint-disable-line no-unused-vars
import { browser } from 'webextension-polyfill-ts'

export const getStorage = (storageType: string) => <T, V extends JsonValue>(
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

export const setStorage = storageType => (
  storageKey: string,
  value: JsonValue
) =>
  new Promise(resolve => {
    browser.storage[storageType]
      .set({ [storageKey]: value })
      .then(result => resolve(result))
  })

export const getLocalStorage: <T, V extends JsonValue>(
  a: T,
  defaultValue?: V
) => Promise<V> = getStorage('local')

export const getLocalStorageBoolean: (
  a: string,
  defaultValue?: boolean
) => Promise<boolean> = (a, defaultValue = false) =>
  getLocalStorage(a, defaultValue)

export const setLocalStorage: <V extends JsonValue>(
  k: string,
  v: V
) => Promise<unknown> = setStorage('local')

export const pushToLocalList: <T>(
  key: string,
  ...items: T[]
) => Promise<void> = (k, ...vals) =>
  getLocalStorage(k, [])
    .then(existingValues => setLocalStorage(k, [...existingValues, ...vals]))
    .then(() => Promise.resolve())

export const popFromLocalList: <T>(key: string) => Promise<T> = k =>
  getLocalStorage(k, []).then(([head, ...tail]) =>
    setLocalStorage(k, tail).then(() => head)
  )
