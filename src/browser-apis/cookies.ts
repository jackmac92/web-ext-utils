import { browser, Cookies } from "webextension-polyfill-ts"; // eslint-disable-line no-unused-vars

const getCookies = (cookieDetails: Cookies.GetAllDetailsType) =>
  browser.cookies.getAll(cookieDetails);

/**
 * @category cookies
 */
export const getCookiesFromDomain = (domain: string) => getCookies({ domain });

/**
 * @category cookies
 */
export const listenForCookieChanges = () => {
  browser.cookies.onChanged.addListener(
    (changeInfo: Cookies.OnChangedChangeInfoType) => {
      console.dir(changeInfo);
    }
  );
};
