import type { JsonValue, JsonObject } from 'type-fest';
import { browser } from "webextension-polyfill-ts";

/**
 * @category storage
 */
class BaseStorageApi {
  storageType: "local" | "sync";
  constructor(storageType: "local" | "sync") {
    this.storageType = storageType;
  }
  get<T extends NonNullable<JsonValue>, V extends JsonValue>(
    storageKey: T,
    defaultValue?: V
  ): Promise<V> {
    return new Promise((resolve, reject) => {
      browser.storage[this.storageType]
        .get([storageKey])
        .then((result: JsonObject) => {
          const r = result[storageKey.toString()];
          if (defaultValue === undefined && !r) {
            reject(result);
          }
          resolve(
            // @ts-expect-error
            r || defaultValue
          );
        }).catch((err) => {
          console.warn("Storage lookup failed!")
          console.error(err)
        });
    });
  }
  set(storageKey: string, value: JsonValue) {
    return new Promise((resolve) => {
      browser.storage[this.storageType]
        .set({ [storageKey]: value })
        .then((result) => resolve(result));
    });
  }
}

/**
 * @category storage
 */
export const getStorage = (storageType: "local" | "sync") => <
  T extends NonNullable<JsonValue>,
  V extends JsonValue
>(
  storageKey: T,
  defaultValue?: V
): Promise<V> => new BaseStorageApi(storageType).get(storageKey, defaultValue);

/**
 * @category storage
 */
export const setStorage = (storageType: "local" | "sync") => (
  storageKey: string,
  value: JsonValue
) => new BaseStorageApi(storageType).set(storageKey, value);

/**
 * @category storage
 */
export const getSyncStorage: <
  T extends NonNullable<JsonValue>,
  V extends JsonValue
  >(
  a: T,
  defaultValue?: V
) => Promise<V> = getStorage("sync");

/**
 * @category storage
 */
export const getLocalStorage: <
  T extends NonNullable<JsonValue>,
  V extends JsonValue
  >(
  a: T,
  defaultValue?: V
) => Promise<V> = getStorage("local");

/**
 * @category storage
 */
export const getLocalStorageBoolean: (
  a: string,
  defaultValue?: boolean
) => Promise<boolean> = (a, defaultValue = false) =>
    getLocalStorage(a, defaultValue);

/**
 * @category storage
 */
export const setLocalStorage: (
  k: string,
  v: any | any[]
) => Promise<unknown> = setStorage("local");

/**
 * @category storage
 */
export const pushToLocalList: <T>(
  key: string,
  ...items: T[]
) => Promise<void> = (k, ...vals) =>
    getLocalStorage(k, [])
      .then((existingValues) => setLocalStorage(k, [...existingValues, ...vals]))
      .then(() => Promise.resolve());

/**
 * @category storage
 */
export const popFromLocalList: <T>(key: string) => Promise<T> = (k) =>
  getLocalStorage(k, []).then(([head, ...tail]) =>
    setLocalStorage(k, tail).then(() => head)
  );
