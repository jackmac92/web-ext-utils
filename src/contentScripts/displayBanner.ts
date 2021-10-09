import browser from 'webextension-polyfill'; // eslint-disable-line no-unused-vars

const injectBannerOnPage = (message: string, bannerUuid: string) => {
  const banner = document.createElement("div");
  banner.id = "browixir-banner";
  banner.style.width = "100vw";
  banner.style.height = "8vw";
  banner.style.position = "absolute";
  banner.style.top = "0";
  banner.style.left = "0";
  banner.style.background = "green";
  banner.style.color = "yellow";
  banner.style.display = "flex";
  // banner.style["align-items"] = "center";
  // banner.style["justify-content"] = "center";

  const copyContainer = document.createElement("span");
  copyContainer.innerText = message;
  const confirmButton = document.createElement("button");
  confirmButton.innerText = "Yes!";
  confirmButton.onclick = () =>
    browser.runtime.sendMessage({ type: "USER_CONFIRM", uuid: bannerUuid });
  const rejectButton = document.createElement("button");
  rejectButton.onclick = () =>
    browser.runtime.sendMessage({ type: "USER_REJECT", uuid: bannerUuid });
  rejectButton.innerText = "Nope";
  banner.appendChild(copyContainer);
  banner.appendChild(confirmButton);
  banner.appendChild(rejectButton);
  document.body.appendChild(banner);
  document.addEventListener("visibilitychange", _e => {
    if (document.hidden) {
      document.body.removeChild(banner);
    }
  });
  return `Returning from the content script (much cool) ${document.title}`;
};

// @ts-ignore
window.injectBannerOnPage = injectBannerOnPage;
