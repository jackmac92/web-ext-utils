import { browser, Events } from "webextension-polyfill-ts";
import { getLocalStorage, setLocalStorage } from "../browser-apis/storage";
import { nanoid } from "nanoid";

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
    localId = nanoid();
    await setLocalStorage(installIdKey, localId);
  }
  return localId;
};

export const getApplicationId = () => browser.runtime.id;

const defaultEventMatcher = () => Promise.resolve(true);

type EventHandler<T> = T extends Events.Event<infer R> ? R : never;

type CatchallFunc = (...args: any[]) => any;
interface EventTypeHelper {
  addListener: Function | CatchallFunc;
  removeListener: Function;
}
export const oneShotEventHandler = <T extends EventTypeHelper>(
  eventType: T,
  matchesTargetEvent: (
    ...eventArgs: T["addListener"] extends (arg: infer R) => void
      ? R extends (...args: any[]) => any
        ? Parameters<R>[]
        : any[]
      : any[]
  ) => Promise<boolean> = defaultEventMatcher
) =>
  new Promise((resolve, reject) => {
    const handlerTimeout = setTimeout(reject, 1000 * 60);

    // @ts-ignore
    const entAddListen = eventType.addListener;

    const handlerHelper = (
      ...eventArgs: Parameters<typeof matchesTargetEvent>
    ) => {
      Promise.resolve(matchesTargetEvent(...eventArgs))
        .then(isTheCorrectEvent => {
          if (isTheCorrectEvent) {
            resolve(...eventArgs);
            clearTimeout(handlerTimeout);
            // @ts-ignore
            eventType.removeListener(handlerHelper);
          }
        })
        .catch(err => {
          console.warn(
            "Ignoring error encountered when checking for target event",
            err
          );
        });
    };
    // @ts-ignore
    eventType.addListener(handlerHelper);
  });

/**
 * This func is mainly designed to work with downloads.onDeterminingFileName
 */
export const oneShotEventHandlerSyncCheck = (
  eventType,
  matchesTargetEvent: (...args: any[]) => boolean = () => true
) =>
  new Promise((resolve, reject) => {
    const handlerTimeout = setTimeout(reject, 1000 * 60);
    const handlerHelper = (...eventArgs: any[]) => {
      const isCorrectEvent = matchesTargetEvent(...eventArgs);
      if (isCorrectEvent) {
        resolve(...eventArgs);
        clearTimeout(handlerTimeout);
        eventType.removeListener(handlerHelper);
        return true;
      }
    };
    eventType.addListener(handlerHelper);
  });
