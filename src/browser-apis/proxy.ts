import { browser } from "webextension-polyfill-ts";

/**
 * @hidden
 */
export const stolenDemoCode = () => {
  const config = {
    mode: "fixed_servers",
    rules: {
      proxyForHttp: {
        scheme: "socks5",
        host: "1.2.3.4"
      },
      bypassList: ["foobar.com"]
    }
  };

  browser.proxy.settings.set({ value: config, scope: "regular" });
};
