import browser from 'webextension-polyfill';

type validationHandler = (el: any) => boolean;
type locateElementHandler = () => any;

/** @hidden */
const MAX_ATTEMPTS = 20;

export const elementLocated = (
  el: unknown,
  validator: validationHandler = () => true
) => {
  if (el === undefined) {
    return false;
  }

  if (validator !== undefined) {
    return validator(el);
  }

  return true;
};

export const scrapeInfo = async (
  item: string,
  locator: locateElementHandler,
  validator: validationHandler
) => {
  const payload = await new Promise((resolve, reject) => {
    let element: ReturnType<typeof locator>;
    let attempts = 0;
    const waitForEl = setInterval(() => {
      if (elementLocated(element, validator)) {
        clearInterval(waitForEl);
        resolve({
          action: item,
          data: element
        });
      } else if (attempts < MAX_ATTEMPTS) {
        attempts += 1;
        element = locator();
      } else {
        reject("Failing to locate element");
      }
    }, 1000);
  });
  browser.runtime.sendMessage({ type: "SCRAPE_INFO", payload });
};
