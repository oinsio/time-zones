import { STORAGE_AVAILABILITY_PROBE_KEY } from "@/constants";
import type { StorageAvailability } from "@/ports";

const PROBE_VALUE = "1";

/**
 * Probes a Web Storage object by writing and removing one key; private mode
 * and full quotas make the write throw.
 * Implements FR9 of add-main-page-scaffold.
 */
export const createLocalStorageAvailability = (
  storage: Storage,
): StorageAvailability => ({
  isStorageAvailable() {
    try {
      storage.setItem(STORAGE_AVAILABILITY_PROBE_KEY, PROBE_VALUE);
      storage.removeItem(STORAGE_AVAILABILITY_PROBE_KEY);
      return true;
    } catch {
      return false;
    }
  },
});

/** Probes the browser's `localStorage`; the access itself may throw. */
export const localStorageAvailability: StorageAvailability = {
  isStorageAvailable() {
    try {
      return createLocalStorageAvailability(
        globalThis.localStorage,
      ).isStorageAvailable();
    } catch {
      return false;
    }
  },
};
