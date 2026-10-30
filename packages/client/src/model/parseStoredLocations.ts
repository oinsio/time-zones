import {
  DEVICE_TIME_LOCATION_ID,
  DEVICE_TIME_ZONE_FALLBACK_ID,
} from "@/constants";
import { buildDeviceTimeLocation } from "./deviceTimeLocation";
import { LocationKind } from "./locationKind";
import {
  buildLocationId,
  canonicalizeLocationId,
  type Location,
} from "./locations";
import { canonicalizeTimeZoneId } from "./timeZoneId";

/**
 * Validates the payload of the stored locations document.
 * Implements FR9, FR12 of add-locations-via-search (D4).
 * Implements FR8, FR9 of set-home-location-and-show-differences (D6).
 * Implements FR13, FR14 of add-settings-page-and-device-time-location (D2).
 */
export type ParseStoredLocationsResult =
  | {
      ok: true;
      locations: readonly Location[];
      /** Always an id of `locations`, or `null`. */
      homeLocationId: string | null;
    }
  | { ok: false };

/** ISO 3166-1 alpha-2 code, or empty for zones without a country. */
const COUNTRY_CODE_PATTERN = /^([A-Z]{2})?$/;

const REJECTED: ParseStoredLocationsResult = { ok: false };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/** The document is rejected as a whole when any entry is invalid. */
export function parseStoredLocations(
  payload: unknown,
): ParseStoredLocationsResult {
  if (!isRecord(payload) || !Array.isArray(payload.locations)) return REJECTED;
  const locations: Location[] = [];
  const knownIds = new Set<string>();
  let isDeviceTimeListed = false;
  for (const entry of payload.locations) {
    if (isRecord(entry) && entry.kind === LocationKind.DEVICE_TIME) {
      const hasZoneFields =
        "timeZoneId" in entry || "label" in entry || "countryCode" in entry;
      if (hasZoneFields || isDeviceTimeListed) return REJECTED;
      isDeviceTimeListed = true;
      locations.push(buildDeviceTimeLocation(DEVICE_TIME_ZONE_FALLBACK_ID));
      knownIds.add(DEVICE_TIME_LOCATION_ID);
      continue;
    }
    if (
      !isRecord(entry) ||
      (entry.kind !== undefined && entry.kind !== LocationKind.CITY) ||
      typeof entry.timeZoneId !== "string" ||
      typeof entry.label !== "string" ||
      typeof entry.countryCode !== "string" ||
      !COUNTRY_CODE_PATTERN.test(entry.countryCode)
    ) {
      return REJECTED;
    }
    const timeZoneId = canonicalizeTimeZoneId(entry.timeZoneId);
    if (timeZoneId === undefined) return REJECTED;
    const id = buildLocationId(timeZoneId, entry.label);
    if (knownIds.has(id)) continue;
    knownIds.add(id);
    locations.push({
      id,
      kind: LocationKind.CITY,
      timeZoneId,
      label: entry.label,
      countryCode: entry.countryCode,
    });
  }
  const homeLocationId = parseHomeLocationId(payload.homeLocationId, knownIds);
  return homeLocationId === undefined
    ? REJECTED
    : { ok: true, locations, homeLocationId };
}

/**
 * `null` for a missing or dangling home (normalized on load, FR9);
 * `undefined` for a value of the wrong type.
 */
function parseHomeLocationId(
  storedValue: unknown,
  knownIds: ReadonlySet<string>,
): string | null | undefined {
  if (storedValue === undefined || storedValue === null) return null;
  if (typeof storedValue !== "string") return undefined;
  if (storedValue === DEVICE_TIME_LOCATION_ID) {
    return knownIds.has(storedValue) ? storedValue : null;
  }
  const homeLocationId = canonicalizeLocationId(storedValue);
  return homeLocationId !== undefined && knownIds.has(homeLocationId)
    ? homeLocationId
    : null;
}
