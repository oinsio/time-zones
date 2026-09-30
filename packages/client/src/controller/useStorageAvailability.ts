import { useState } from "react";
import { localStorageAvailability } from "@/adapters";
import type { StorageAvailability } from "@/ports";

/**
 * Whether the device can persist data; asks the port once on mount.
 * Implements FR9 of add-main-page-scaffold.
 */
export function useStorageAvailability(
  storageAvailability: StorageAvailability = localStorageAvailability,
): boolean {
  const [isStorageAvailable] = useState(() =>
    storageAvailability.isStorageAvailable(),
  );
  return isStorageAvailable;
}
