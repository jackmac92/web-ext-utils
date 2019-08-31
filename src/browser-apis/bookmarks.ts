import { browser } from 'webextension-polyfill-ts'

export const createBookmark = (url: string, title: string) => {
  browser.bookmarks.create({ url, title })
}
