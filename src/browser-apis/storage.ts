import type { JsonValue, JsonObject } from "type-fest";
import { useState, useEffect } from "react";
import browser from "webextension-polyfill";

type storageBackend = "local" | "sync";

/**
 * @category storage
 */
class BaseStorageApi {
  storageType: storageBackend;
  constructor(storageType: storageBackend) {
    this.storageType = storageType;
  }
  get<T extends NonNullable<JsonValue>, V extends JsonValue>(
    storageKey: T,
    defaultValue?: V
  ): Promise<V> {
    return new Promise((resolve) => {
      browser.storage[this.storageType]
        .get([storageKey])
        .then((result: JsonObject) => {
          const r = result[storageKey.toString()];
          resolve(
            // @ts-expect-error
            r || defaultValue
          );
        })
        .catch((err) => {
          console.warn("Storage lookup failed!");
          console.error(err);
        });
    });
  }
  set<T extends NonNullable<JsonValue>, V extends JsonValue>(
    storageKey: T,
    value: V
  ) {
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
export const getStorage =
  (storageType: storageBackend) =>
  <T extends NonNullable<JsonValue>, V extends JsonValue>(
    storageKey: T,
    defaultValue?: V
  ): Promise<V> =>
    new BaseStorageApi(storageType).get(storageKey, defaultValue);

/**
 * @category storage
 */
export const setStorage =
  (storageType: storageBackend) =>
  <T extends NonNullable<JsonValue>, V extends JsonValue>(
    storageKey: T,
    value: V
  ) =>
    new BaseStorageApi(storageType).set(storageKey, value);

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
export const localStorageAtom = <ValueShape extends JsonValue>(
  key: NonNullable<JsonValue>,
  defaultValue?: ValueShape
) => ({
  get: (invocationSpecificDefaultValue?: ValueShape): Promise<ValueShape> =>
    getLocalStorage<NonNullable<JsonValue>, ValueShape>(
      key,
      invocationSpecificDefaultValue || defaultValue
    ),
  set: (v: ValueShape): Promise<unknown> =>
    setLocalStorage<NonNullable<JsonValue>, ValueShape>(key, v),
});

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
export const updateStorage =
  <T extends JsonValue>(storageType: storageBackend) =>
  async (key: string, cb: (a: T) => Promise<T>) => {
    const currVal = await getStorage(storageType)(key);
    // @ts-expect-error
    const updatedVal = await Promise.resolve(cb(currVal));
    return setStorage(storageType)(key, updatedVal);
  };

/**
 * @category storage
 */
export const popFromLocalList: <T>(key: string) => Promise<T> = (k) =>
  getLocalStorage(k, []).then(([head, ...tail]) =>
    setLocalStorage(k, tail).then(() => head)
  );

const useStorage = <StoredType>(storageType: storageBackend) => {
  const baseStorageApi = new BaseStorageApi(storageType);
  return (key: string, initialValue: StoredType) => {
    if (typeof window === "undefined") {
      return [
        initialValue,
        () => {
          throw Error("Tried to set storage when not on client");
        },
      ];
    }

    // State to store our value
    // Pass initial state function to useState so logic is only executed once
    const [storedValue, setStoredValue] = useState(initialValue);
    useEffect(() => {
      baseStorageApi.get(key).then((val) => {
        if (val) {
          // @ts-expect-error
          setStoredValue(val);
        }
      });
    }, []);

    // Return a wrapped version of useState's setter function that ...
    // ... persists the new value to localStorage.
    const setValue = (value: StoredType | ((a: StoredType) => StoredType)) => {
      if (typeof window == "undefined") {
        console.warn(
          `Tried setting localStorage key “${key}” even though environment is not a client`
        );
      }

      try {
        // Allow value to be a function so we have same API as useState
        const valueToStore =
          value instanceof Function ? value(storedValue) : value;
        // Save to local storage
        // @ts-expect-error
        baseStorageApi.set(key, valueToStore);
        // Save state
        setStoredValue(valueToStore);
      } catch (error) {
        // A more advanced implementation would handle the error case
        console.error(error);
      }
    };
    return [storedValue, setValue] as const;
  };
};

export const useSyncStorage = useStorage("sync");
export const useLocalStorage = useStorage("local");
