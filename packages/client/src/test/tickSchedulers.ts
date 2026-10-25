import type { TickScheduler } from "@/controller";

/** Holds the latest scheduled tick until the test runs it. */
export function createManualTickScheduler() {
  let pending: (() => void) | undefined;
  let lastDelay: number | undefined;
  const scheduler: TickScheduler = {
    schedule: (callback, delayMs) => {
      pending = callback;
      lastDelay = delayMs;
      return () => {
        if (pending === callback) pending = undefined;
      };
    },
  };
  return {
    ...scheduler,
    lastDelayMs: () => lastDelay,
    hasPending: () => pending !== undefined,
    runPending: () => {
      const callback = pending;
      pending = undefined;
      callback?.();
    },
  };
}
