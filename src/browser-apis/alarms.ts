import { differenceInMilliseconds } from "date-fns";
import { Alarms, browser } from "webextension-polyfill-ts";

/** @hidden */
export type intervalType = (a: () => void, b: number) => () => void;

const createAlarm = (id: string, options: Alarms.CreateAlarmInfoType) => browser.alarms.create(id, options)

/**
 * @param cb - Callback to use in the timeout func
 * @param ms - millisecond delay for timeout
 *
 * @returns Function to cancel the timeout
 * @category alarms
 */
export const browserSetTimeout: intervalType = (cb, ms) => {
  const cbUuid = `${Math.random()}`;
  createAlarm(cbUuid, {
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

/**
 * @param cb - Callback to use in the interval func
 * @param ms - millisecond interval
 *
 * @returns Function to cancel the interval
 * @category alarms
 */
export const browserSetInterval: intervalType = (cb, ms) => {
  const cbUuid = `${Math.random()}`;
  createAlarm(cbUuid, {
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

/**
 * @param cb - Callback to use in the interval func
 * @param at - Datetime when cb should run
 *
 * @returns Function to cancel the interval
 * @category alarms
 */
export const browserRunAt = (cb: () => never, at: Date) => {
  const msTilRun = differenceInMilliseconds(at, Date.now());
  return browserSetTimeout(cb, msTilRun);
};
