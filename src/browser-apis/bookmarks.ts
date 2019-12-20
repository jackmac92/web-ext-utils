import { browser } from 'webextension-polyfill-ts'

export const createBookmark = (url: string, title: string) => {
  browser.bookmarks.create({ url, title })
}

const getChildBookmarks = (
  prom: Promise<any[]>,
  node: chrome.bookmarks.BookmarkTreeNode
): Promise<any[]> =>
  prom.then(async acc => {
    if (!node.url) {
      if (!(node.children && node.children.length > 0)) {
        console.warn('Found empty folder?', node.title)
        return acc
      }
      const chillen = await browser.bookmarks.getChildren(node.id)
      const devouredChillen = await chillen.reduce(
        getChildBookmarks,
        Promise.resolve([])
      )
      return [...acc, ...devouredChillen]
    }
    return [
      ...acc,
      {
        link: node.url,
        title: node.title,
        addedAt: node.dateAdded,
        groupLastModified: node.dateGroupModified
      }
    ]
  })

export const exportEverything = async () => {
  const allBookmarks = await browser.bookmarks.getTree()
  const result = await allBookmarks.reduce(
    getChildBookmarks,
    Promise.resolve([])
  )
  navigator.clipboard.writeText(JSON.stringify(result))
}
