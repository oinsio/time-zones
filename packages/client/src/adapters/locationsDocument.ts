import { LOCATIONS_SCHEMA_VERSION } from "@/constants";
import { LocationKind, parseStoredLocations } from "@/model";
import {
  type LocationsLoadResult,
  LocationsLoadStatus,
  type StoredLocations,
} from "@/ports";

/**
 * The stored locations document: `{ schemaVersion, payload }` (ADR-0004).
 * Implements FR9, FR11, FR12 of add-locations-via-search (D4).
 * Implements FR8, FR9 of set-home-location-and-show-differences (D6).
 */

/** Upgrades a payload from the version it is keyed by to the next one. */
export type PayloadMigrations = Readonly<
  Record<number, (payload: unknown) => unknown>
>;

/**
 * Version 1 had no home location: the migration adds "no home" (FR8). Version 2
 * showed the device time as a derived row outside the list: the migration
 * lists the device time location first (FR14 of add-settings-page-and-device-time-location, D2).
 */
export const LOCATION_MIGRATIONS: PayloadMigrations = {
  1: (payload) => ({ ...(payload as object), homeLocationId: null }),
  2: (payload) => {
    const stored = payload as { locations?: unknown };
    if (!Array.isArray(stored?.locations)) return payload;
    return {
      ...stored,
      locations: [{ kind: LocationKind.DEVICE_TIME }, ...stored.locations],
    };
  },
};

const UNREADABLE: LocationsLoadResult = {
  status: LocationsLoadStatus.UNREADABLE,
};

export function serializeLocationsDocument(
  { locations, homeLocationId }: StoredLocations,
  schemaVersion = LOCATIONS_SCHEMA_VERSION,
): string {
  return JSON.stringify({
    schemaVersion,
    payload: {
      locations: locations.map((location) =>
        location.kind === LocationKind.DEVICE_TIME
          ? { kind: location.kind }
          : {
              kind: location.kind,
              timeZoneId: location.timeZoneId,
              label: location.label,
              countryCode: location.countryCode,
            },
      ),
      homeLocationId,
    },
  });
}

/** Upgrades to the current version; `undefined` when a step is missing. */
function migratePayload(
  storedVersion: number,
  payload: unknown,
  currentVersion: number,
  migrations: PayloadMigrations,
): unknown {
  let migratedPayload = payload;
  for (let version = storedVersion; version < currentVersion; version += 1) {
    const migrate = migrations[version];
    if (!migrate) return undefined;
    migratedPayload = migrate(migratedPayload);
  }
  return migratedPayload;
}

/** Any document that cannot be read as a valid one is `UNREADABLE`. */
export function deserializeLocationsDocument(
  rawDocument: string | null,
  currentVersion = LOCATIONS_SCHEMA_VERSION,
  migrations: PayloadMigrations = LOCATION_MIGRATIONS,
): LocationsLoadResult {
  if (rawDocument === null) return { status: LocationsLoadStatus.EMPTY };
  try {
    const { schemaVersion, payload } = JSON.parse(rawDocument);
    if (!Number.isInteger(schemaVersion) || schemaVersion > currentVersion) {
      return UNREADABLE;
    }
    const parsed = parseStoredLocations(
      migratePayload(schemaVersion, payload, currentVersion, migrations),
    );
    return parsed.ok
      ? {
          status: LocationsLoadStatus.LOADED,
          locations: parsed.locations,
          homeLocationId: parsed.homeLocationId,
        }
      : UNREADABLE;
  } catch {
    return UNREADABLE;
  }
}
