export const whenPageReady = (action: () => void, urlSelector = /./) => {
  const readyStateCheckInterval = setInterval(() => {
    if (document.readyState === "complete") {
      clearInterval(readyStateCheckInterval);
      if (window.location.href.match(urlSelector)) {
        action();
      }
    }
  }, 10);
};
