/**
 * Tells whether the device can persist data.
 * Implements FR9 of add-main-page-scaffold.
 */
export interface StorageAvailability {
  isStorageAvailable(): boolean;
}
