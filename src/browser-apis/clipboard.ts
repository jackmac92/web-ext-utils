import { textNotification } from "./notifications";
import { browser } from "webextension-polyfill-ts";

export function writeToClipboardViaNavigator(newClip: string): Promise<void> {
  // NB: not using this one since it just don't work for extensions :noidea:, getting an error that the dom is not focused
  return (
    navigator.permissions
      // @ts-ignore
      .query({ name: "clipboard-write" })
      .then((result: { state: string }) => {
        if (result.state == "granted" || result.state == "prompt") {
          return navigator.clipboard
            .writeText(newClip)
            .catch((err) => Promise.reject(err));
        }
        return Promise.reject("No clipboard access");
      })
  );
}
async function writeToClipboard(newClip: string): Promise<void> {
  const bg = browser.extension.getBackgroundPage(); // get the background page
  bg.document.body.innerHTML = ""; // clear the background page

  // add a DIV, contentEditable=true, to accept the paste action
  const helperElement = bg.document.createElement("textarea");
  document.body.appendChild(helperElement);
  helperElement.value = newClip;

  // focus the helper div's content
  const range = document.createRange();
  range.selectNode(helperElement);
  const currSelection = window.getSelection();
  if (currSelection === null) {
    throw Error("Couldn't find the current window selection");
  }
  currSelection.removeAllRanges();
  currSelection.addRange(range);
  helperElement.focus();

  // trigger the paste action
  bg.document.execCommand("copy");
}

export function promptToCopyViaNotification(
  message: string,
  contentToCopy: string
) {
  return textNotification(
    message,
    "Click this notification to copy it to your clipboard!",
    () => writeToClipboard(contentToCopy)
  );
}
