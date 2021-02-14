import { browser, Management } from "webextension-polyfill-ts"; // eslint-disable-line no-unused-vars

/**
 * @category extensionManagement
 */
export const listExtensions = async (
  excludeSelf = true
): Promise<Management.ExtensionInfo[]> => {
  const allInstalledItems = await browser.management.getAll();
  const maybeFilterSelf = await (async () => {
    if (!excludeSelf) {
      return () => true;
    }
    const extUrl = await browser.runtime.getURL("");
    const selfId = extUrl.replace("chrome-extension://", "").replace("/", "");
    return (z: { id: string }) => z.id !== selfId;
  })();
  return allInstalledItems
    .filter(z => z.type === "extension")
    .filter(z => z.mayDisable)
    .filter(maybeFilterSelf);
};

/**
 * @category extensionManagement
 */
export const disableExtensions = (extList: Management.ExtensionInfo[]) =>
  Promise.all(
    extList.map(({ id }) => browser.management.setEnabled(id, false))
  );

/**
 * @category extensionManagement
 */
export const enableExtensions = (extList: Management.ExtensionInfo[]) =>
  Promise.all(extList.map(({ id }) => browser.management.setEnabled(id, true)));
