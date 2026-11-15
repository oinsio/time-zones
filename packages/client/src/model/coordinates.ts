import { MAX_LATITUDE_DEGREES, MAX_LONGITUDE_DEGREES } from "@/constants";

/**
 * Latitude and longitude in decimal degrees, north and east positive.
 * Implements FR5, FR6, FR7 of add-city-coordinates-to-locations (D1).
 */
export type Coordinates = { latitude: number; longitude: number };

const isWithin = (value: unknown, limit: number): value is number =>
  typeof value === "number" && Math.abs(value) <= limit;

/** The one validator of coordinates: two numbers in range, otherwise `undefined`. */
export function parseCoordinates(value: unknown): Coordinates | undefined {
  if (typeof value !== "object" || value === null) return undefined;
  const { latitude, longitude } = value as Record<string, unknown>;
  return isWithin(latitude, MAX_LATITUDE_DEGREES) &&
    isWithin(longitude, MAX_LONGITUDE_DEGREES)
    ? { latitude, longitude }
    : undefined;
}
