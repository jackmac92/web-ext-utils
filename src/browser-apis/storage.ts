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
  set<T extends NonNullable<JsonValue>, V extends JsonValue>(storageKey: T, value: V) {
    return new Promise((resolve) => {
      browser.storage[this.storageType]
        // @ts-expect-error
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
export const setStorage = (storageType: "local" | "sync") => <
  T extends NonNullable<JsonValue>,
  V extends JsonValue
>(
  storageKey: T,
  value: V
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

export const localStorageAtom = <ValueShape extends JsonValue>(key: NonNullable<JsonValue>) => ({
  get: (): Promise<ValueShape> => getLocalStorage<NonNullable<JsonValue>, ValueShape>(key),
  set: (v: ValueShape): Promise<unknown> => setLocalStorage<NonNullable<JsonValue>, ValueShape>(key, v)
})

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
export const setLocalStorage: <
  T extends NonNullable<JsonValue>,
  V extends JsonValue
  >(
  k: T,
  v: V
) => Promise<unknown> = setStorage("local");

/**
 * @category storage
 */
export const pushToLocalList: <T extends JsonValue>(
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
