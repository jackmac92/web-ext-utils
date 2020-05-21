import { browser } from "webextension-polyfill-ts";

/** @hidden */
export type intervalType = (a: () => void, b: number) => () => void;

export const browserSetTimeout: intervalType = (cb, ms) => {
  const cbUuid = `${Math.random()}`;
  browser.alarms.create(cbUuid, {
    when: Date.now() + ms
  });
  const cleanup = () => {
    browser.alarms.onAlarm.removeListener(alarmHandler);
    browser.alarms.clear(cbUuid);
  };
  const alarmHandler = ({ name }: { name: string }) => {
    if (name === cbUuid) {
      cleanup();
      cb();
    }
  };
  browser.alarms.onAlarm.addListener(alarmHandler);
  return cleanup;
};

export const browserSetInterval: intervalType = (cb, ms) => {
  const cbUuid = `${Math.random()}`;
  browser.alarms.create(cbUuid, {
    periodInMinutes: ms / 1000 / 60,
    when: Date.now() + ms
  });
  const cleanup = () => {
    browser.alarms.onAlarm.removeListener(alarmHandler);
    browser.alarms.clear(cbUuid);
  };
  const alarmHandler = ({ name }: { name: string }) => {
    if (name === cbUuid) {
      cb();
    }
  };
  browser.alarms.onAlarm.addListener(alarmHandler);
  return cleanup;
};
