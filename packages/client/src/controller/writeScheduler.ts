/**
 * Schedules a debounced storage write; returns a function that cancels it.
 * Implements FR11 of add-locations-via-search (D5).
 */
export type WriteScheduler = {
  schedule(callback: () => void, delayMs: number): () => void;
};

export const timeoutWriteScheduler: WriteScheduler = {
  schedule: (callback, delayMs) => {
    const timeoutId = setTimeout(callback, delayMs);
    return () => clearTimeout(timeoutId);
  },
};
