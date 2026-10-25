/**
 * Schedules the next minute tick; returns a function that cancels it.
 * Implements FR3 of show-local-time-and-date-on-location-cards (D4).
 */
export type TickScheduler = {
  schedule(callback: () => void, delayMs: number): () => void;
};

export const timeoutTickScheduler: TickScheduler = {
  schedule: (callback, delayMs) => {
    const timeoutId = setTimeout(callback, delayMs);
    return () => clearTimeout(timeoutId);
  },
};
