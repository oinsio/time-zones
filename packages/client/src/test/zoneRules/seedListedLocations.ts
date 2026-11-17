/**
 * Stores a location list of city locations in `localStorage`, as the app
 * reads it at start.
 * Implements FR9 of apply-data-updates-silently.
 */
import { LOCATIONS_SCHEMA_VERSION, STORAGE_KEYS } from "@/constants";
import { LocationKind } from "@/model";

export type SeededLocation = {
  timeZoneId: string;
  label: string;
  countryCode: string;
};

export function seedListedLocations(locations: SeededLocation[]): void {
  localStorage.setItem(
    STORAGE_KEYS.LOCATIONS,
    JSON.stringify({
      schemaVersion: LOCATIONS_SCHEMA_VERSION,
      payload: {
        locations: locations.map((location) => ({
          kind: LocationKind.CITY,
          ...location,
        })),
        homeLocationId: null,
      },
    }),
  );
}

export const LISBON_LOCATION: SeededLocation = {
  timeZoneId: "Europe/Lisbon",
  label: "Lisbon",
  countryCode: "PT",
};
