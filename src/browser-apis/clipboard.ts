import { textNotification } from "./notifications";

export function writeToClipboard(newClip: string): Promise<void> {
  return (
    navigator.permissions
      // @ts-ignore
      .query({ name: "clipboard-write" })
      .then((result: { state: string }) => {
        if (result.state == "granted" || result.state == "prompt") {
          return navigator.clipboard
            .writeText(newClip)
            .catch(err => Promise.reject(err));
        }
        return Promise.reject("No clipboard access");
      })
  );
}

export function writeToClipboardViaContentScript(
  newClip: string
): Promise<boolean | void> {
  return (
    navigator.permissions
      // @ts-ignore
      .query({ name: "clipboard-write" })
      .then((result: { state: string }) => {
        if (result.state == "granted" || result.state == "prompt") {
          return navigator.clipboard
            .writeText(newClip)
            .catch(err => Promise.reject(err));
        }
        return Promise.reject("No clipboard access");
      })
  );
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
