import browser, { Bookmarks } from "webextension-polyfill"; // eslint-disable-line no-unused-vars

/**
 * @category bookmarks
 */
export const createBookmark = (url: string, title: string) =>
  browser.bookmarks.create({ url, title });

const getChildBookmarks = (
  prom: Promise<Bookmarks.BookmarkTreeNode[]>,
  node: Bookmarks.BookmarkTreeNode
): Promise<Bookmarks.BookmarkTreeNode[]> =>
  prom.then(async acc => {
    if (!node.url) {
      if (!(node.children && node.children.length > 0)) {
        console.warn("Found empty folder?", node.title);
        return acc;
      }
      const chillen = await browser.bookmarks.getChildren(node.id);
      return chillen.reduce(getChildBookmarks, Promise.resolve(acc));
    }
    return [...acc, node];
  });

/**
 * @category bookmarks
 * @returns An array of bookmark entriies
 */
export const exportAllBookmarks = async () => {
  const allBookmarks = await browser.bookmarks.getTree();
  const fullBookmarks = await allBookmarks.reduce(
    getChildBookmarks,
    Promise.resolve([])
  );
  return fullBookmarks.map(node => ({
    link: node.url,
    title: node.title,
    addedAt: node.dateAdded,
    groupLastModified: node.dateGroupModified
  }));
};
