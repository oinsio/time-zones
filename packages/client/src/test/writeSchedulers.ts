import type { WriteScheduler } from "@/controller";

/** Runs a scheduled write at once, so tests need no timers. */
export const immediateWriteScheduler: WriteScheduler = {
  schedule: (callback) => {
    callback();
    return () => undefined;
  },
};

/** Holds the latest scheduled write until the test runs it. */
export function createManualWriteScheduler() {
  let pending: (() => void) | undefined;
  let lastDelay: number | undefined;
  return {
    schedule: (callback: () => void, delayMs: number) => {
      pending = callback;
      lastDelay = delayMs;
      return () => {
        if (pending === callback) pending = undefined;
      };
    },
    lastDelayMs: () => lastDelay,
    runPending: () => {
      const callback = pending;
      pending = undefined;
      callback?.();
    },
  };
}
