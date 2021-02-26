import { browser, Windows } from "webextension-polyfill-ts"; // eslint-disable-line no-unused-vars

/** @hidden */
export const createSidekickWindow = async (
  url: string | string[]
): Promise<Windows.Window> => {
  const wndw: Windows.Window = await browser.windows.getCurrent();
  const { id, height, width, top, left } = wndw;
  if (
    !(
      typeof height === "number" &&
      typeof width === "number" &&
      typeof id === "number" &&
      typeof left === "number" &&
      typeof top === "number"
    )
  ) {
    throw Error("Failed to get the dimensions of the current window");
  }
  // NOTE can't change the active window dimensions for security reasons
  return browser.windows.create({
    url,
    type: "popup",
    top: 0,
    left: 0,
    height,
    width: Math.max(left, 250)
  });
};
