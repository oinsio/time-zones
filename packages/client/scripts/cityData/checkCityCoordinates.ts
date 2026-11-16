/**
 * Checks of the coordinates of one city tuple of the committed city data.
 * Implements FR1, FR4 of add-city-coordinates-to-locations (D2, D4).
 */
import {
  COORDINATE_TENTHS_PER_DEGREE,
  MAX_LATITUDE_DEGREES,
  MAX_LONGITUDE_DEGREES,
} from "../../src/constants/coordinates.ts";
import { describeCity } from "./describeCity.ts";

const MAX_LATITUDE_TENTHS = MAX_LATITUDE_DEGREES * COORDINATE_TENTHS_PER_DEGREE;
const MAX_LONGITUDE_TENTHS =
  MAX_LONGITUDE_DEGREES * COORDINATE_TENTHS_PER_DEGREE;

function isTenthsWithin(value: unknown, limit: number): boolean {
  return Number.isInteger(value) && Math.abs(value as number) <= limit;
}

export function checkCoordinates(
  tuple: unknown[],
  latitude: unknown,
  longitude: unknown,
) {
  const errors: string[] = [];
  if (latitude === undefined || longitude === undefined) {
    return [`The city ${describeCity(tuple)} has no coordinates`];
  }
  if (!isTenthsWithin(latitude, MAX_LATITUDE_TENTHS)) {
    errors.push(
      `The city ${describeCity(tuple)} has the latitude ${String(latitude)}`,
    );
  }
  if (!isTenthsWithin(longitude, MAX_LONGITUDE_TENTHS)) {
    errors.push(
      `The city ${describeCity(tuple)} has the longitude ${String(longitude)}`,
    );
  }
  return errors;
}
