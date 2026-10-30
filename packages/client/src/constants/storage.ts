/** Key written and removed to probe whether local storage is usable. */
export const STORAGE_AVAILABILITY_PROBE_KEY = "time-zones:storage-probe";

/** Keys of documents the app persists on the device (ADR-0004). */
export const STORAGE_KEYS = {
  LOCATIONS: "time-zones:locations",
  PREFERENCES: "time-zones:preferences",
} as const;

/** Name of the BroadcastChannel that syncs the locations between tabs. */
export const LOCATIONS_SYNC_CHANNEL_NAME = "time-zones:locations-sync";

/** Name of the BroadcastChannel that syncs the preferences between tabs. */
export const PREFERENCES_SYNC_CHANNEL_NAME = "time-zones:preferences-sync";
