import { LEGACY_ZONE_PROBE_ID } from "@/constants";

const ARRAY_AT_METHOD = "at";

/** Whether the engine rejects the zone renamed in IANA 2022b. */
export function isZoneDataOutdated(): boolean {
  try {
    new Intl.DateTimeFormat("en", { timeZone: LEGACY_ZONE_PROBE_ID });
    return false;
  } catch {
    return true;
  }
}

/**
 * Whether the engine lacks a built-in the app relies on: `Array#at` (marks
 * Safari before 15.4 and covers the core-js gap), `ResizeObserver` or the
 * zone data of IANA 2022b.
 * Implements FR2 of support-legacy-ios-12-safari (D2).
 */
export function needsLegacySupport(): boolean {
  return (
    !(ARRAY_AT_METHOD in Array.prototype) ||
    typeof globalThis.ResizeObserver === "undefined" ||
    isZoneDataOutdated()
  );
}
