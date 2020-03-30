import { browser } from "webextension-polyfill-ts";
import { getLocalStorage, setLocalStorage } from "../browser-apis/storage";

const installIdKey = "applicationId__unieq";

export const getInstallId = () => getLocalStorage<string, string>(installIdKey);

export const ensureInstallId = async (): Promise<string> => {
  let localId: string;
  try {
    localId = await getInstallId();
  } catch (err) {
    console.warn("Encountered an error trying to lookup installId", err);
    localId = "";
  }
  if (!localId || localId.length === 0) {
    localId = (Math.random() * 1000000000000).toString();
    try {
      await setLocalStorage(installIdKey, localId);
    } catch (err) {
      console.error("Failed to set new installId in local storage");
      throw Error(err);
    }
  }
  return localId;
};

export const getApplicationId = () => browser.runtime.id;

export const oneShotEventHandler = eventType =>
  new Promise(resolve => {
    const handlerHelper = (...eventArgs) => {
      resolve(...eventArgs);
      eventType.removeListener(handlerHelper);
    };
    eventType.addListener(handlerHelper);
  });
