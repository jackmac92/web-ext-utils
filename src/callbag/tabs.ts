import { browser } from "webextension-polyfill-ts"; // eslint-disable-line no-unused-vars
// @ts-ignore
import fromAsyncIter from "callbag-from-async-iter";
import { oneShotEventHandler } from "../helpers/misc";

/** @hidden */
async function* allTabChanges() {
  while (true) {
    yield oneShotEventHandler(browser.tabs.onUpdated);
  }
}

/** @hidden */
export const tabUpdateSource = () => fromAsyncIter(allTabChanges());
