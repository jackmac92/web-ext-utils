import { textNotification } from "./notifications";

export function writeToClipboard(newClip: string) {
  return (
    navigator.permissions
      // @ts-ignore
      .query({ name: "clipboard-write" })
      .then((result: { state: string }) => {
        if (result.state == "granted" || result.state == "prompt") {
          return navigator.clipboard.writeText(newClip);
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
