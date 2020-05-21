import { JsonObject, JsonValue } from "type-fest"; // eslint-disable-line no-unused-vars
import { browser } from "webextension-polyfill-ts";

export const getStorage = (storageType: "local" | "sync") => <
  T extends NonNullable<JsonValue>,
  V extends JsonValue
>(
  storageKey: T,
  defaultValue: null | V = null
): Promise<V> =>
  new Promise((resolve, reject) => {
    browser.storage[storageType]
      .get([storageKey])
      .then((result: JsonObject) => {
        const r = result[storageKey.toString()];
        if (defaultValue === null && !r) {
          reject(result);
        }
        // @ts-expect-error
        resolve(r || defaultValue);
      });
  });

export const setStorage = (storageType: "local" | "sync") => (
  storageKey: string,
  value: JsonValue
) =>
  new Promise(resolve => {
    browser.storage[storageType]
      .set({ [storageKey]: value })
      .then(result => resolve(result));
  });

export const getSyncStorage: <
  T extends NonNullable<JsonValue>,
  V extends JsonValue
>(
  a: T,
  defaultValue?: V
) => Promise<V> = getStorage("sync");

export const getLocalStorage: <
  T extends NonNullable<JsonValue>,
  V extends JsonValue
>(
  a: T,
  defaultValue?: V
) => Promise<V> = getStorage("local");

export const getLocalStorageBoolean: (
  a: string,
  defaultValue?: boolean
) => Promise<boolean> = (a, defaultValue = false) =>
  getLocalStorage(a, defaultValue);

export const setLocalStorage: (
  k: string,
  v: any | any[]
) => Promise<unknown> = setStorage("local");

export const pushToLocalList: <T>(
  key: string,
  ...items: T[]
) => Promise<void> = (k, ...vals) =>
  getLocalStorage(k, [])
    .then(existingValues => setLocalStorage(k, [...existingValues, ...vals]))
    .then(() => Promise.resolve());

export const popFromLocalList: <T>(key: string) => Promise<T> = k =>
  getLocalStorage(k, []).then(([head, ...tail]) =>
    setLocalStorage(k, tail).then(() => head)
  );
