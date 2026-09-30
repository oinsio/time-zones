import type { StorageAvailability } from "@/ports";

/**
 * Adapter with a configured answer, for tests and previews.
 * Implements FR9 of add-main-page-scaffold.
 */
export const inMemoryStorageAvailability = (
  isAvailable: boolean,
): StorageAvailability => ({
  isStorageAvailable: () => isAvailable,
});
