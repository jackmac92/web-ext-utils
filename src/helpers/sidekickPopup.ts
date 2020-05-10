import { browser, Windows } from "webextension-polyfill-ts";

export const createSidekickWindow = async (
  url: string | string[]
): Promise<Windows.Window> => {
  const window: Windows.Window = await browser.windows.getCurrent();
  const { id, height, width, top, left } = window;
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
  const sidekickWidth = Math.ceil(width / 5);
  await browser.windows.update(id, {
    width: width - sidekickWidth,
    left: left + sidekickWidth
  });
  return browser.windows.create({
    url,
    type: "popup",
    top,
    left,
    height,
    width: sidekickWidth
  });
};
