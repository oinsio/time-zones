import { MAX_LATITUDE_DEGREES, MAX_LONGITUDE_DEGREES } from "@/constants";

/**
 * Latitude and longitude in decimal degrees, north and east positive.
 * Implements FR5, FR6, FR7 of add-city-coordinates-to-locations (D1).
 */
export type Coordinates = { latitude: number; longitude: number };

function isFiniteWithin(value: unknown, limit: number): value is number {
  return (
    typeof value === "number" &&
    Number.isFinite(value) &&
    Math.abs(value) <= limit
  );
}

/** The one validator of coordinates: two finite numbers in range, otherwise `undefined`. */
export function parseCoordinates(value: unknown): Coordinates | undefined {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return undefined;
  }
  const { latitude, longitude } = value as Record<string, unknown>;
  if (!isFiniteWithin(latitude, MAX_LATITUDE_DEGREES)) return undefined;
  if (!isFiniteWithin(longitude, MAX_LONGITUDE_DEGREES)) return undefined;
  return { latitude, longitude };
}
