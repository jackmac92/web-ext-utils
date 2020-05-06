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
