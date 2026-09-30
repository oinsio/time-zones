import { LOCATIONS_SCHEMA_VERSION } from "@/constants";
import { type Location, parseStoredLocations } from "@/model";
import { type LocationsLoadResult, LocationsLoadStatus } from "@/ports";

/**
 * The stored locations document: `{ schemaVersion, payload }` (ADR-0004).
 * Implements FR9, FR11, FR12 of add-locations-via-search (D4).
 */

/** Upgrades a payload from the version it is keyed by to the next one. */
export type PayloadMigrations = Readonly<
  Record<number, (payload: unknown) => unknown>
>;

/** Version 1 is the first version: nothing to migrate from yet. */
export const LOCATION_MIGRATIONS: PayloadMigrations = {};

const UNREADABLE: LocationsLoadResult = {
  status: LocationsLoadStatus.UNREADABLE,
};

export function serializeLocationsDocument(
  locations: readonly Location[],
  schemaVersion = LOCATIONS_SCHEMA_VERSION,
): string {
  return JSON.stringify({
    schemaVersion,
    payload: {
      locations: locations.map(({ timeZoneId, label, countryCode }) => ({
        timeZoneId,
        label,
        countryCode,
      })),
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
      ? { status: LocationsLoadStatus.LOADED, locations: parsed.locations }
      : UNREADABLE;
  } catch {
    return UNREADABLE;
  }
}
