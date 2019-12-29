import { browser, Cookies } from 'webextension-polyfill-ts' // eslint-disable-line no-unused-vars

const getCookies = (cookieDetails: Cookies.GetAllDetailsType) =>
  browser.cookies.getAll(cookieDetails)

export const getCookiesFromDomain = domain => getCookies({ domain })

export const listenForCookieChanges = () => {
  browser.cookies.onChanged.addListener(
    (changeInfo: Cookies.OnChangedChangeInfoType) => {
      console.dir(changeInfo)
    }
  )
}
