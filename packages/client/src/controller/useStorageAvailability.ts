import { useEffect, useState } from "react";
import { localStorageAvailability } from "@/adapters";
import type { StorageAvailability } from "@/ports";

/**
 * Whether the device can persist data; asks the port once on mount. Starts
 * as available and corrects after mount, so a warning is inserted into an
 * already rendered live region and gets announced (NFR-A2).
 * Implements FR9 of add-main-page-scaffold.
 */
export function useStorageAvailability(
  storageAvailability: StorageAvailability = localStorageAvailability,
): boolean {
  const [isStorageAvailable, setIsStorageAvailable] = useState(true);
  useEffect(() => {
    setIsStorageAvailable(storageAvailability.isStorageAvailable());
  }, [storageAvailability]);
  return isStorageAvailable;
}
