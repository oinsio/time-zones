import { UTC_ZONE_ID } from "./search";

/**
 * Device zone used until the real one is set, and for an unknown identifier.
 * Implements FR3 of mark-device-time-zone-in-location-list.
 */
export const DEVICE_TIME_ZONE_FALLBACK_ID = UTC_ZONE_ID;
