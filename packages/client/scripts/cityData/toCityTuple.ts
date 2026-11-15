/**
 * Turns a compiled city into one tuple of the committed city data.
 * Implements FR1 of add-city-coordinates-to-locations (D2).
 */
import { COORDINATE_TENTHS_PER_DEGREE } from "../../src/constants/coordinates.ts";
import type { CityNames, CityTuple, GeoNamesCityRow } from "./cityDataTypes.ts";
import { NO_RUSSIAN_NAME_MARKER } from "./constants.ts";

/** A city row with the names and the zone chosen for it. */
export type CompiledCity = {
  row: GeoNamesCityRow;
  names: CityNames;
  zoneId: string;
};

function toTenths(degrees: number): number {
  // `+ 0` turns -0 into 0, so the file never holds "-0".
  return Math.round(degrees * COORDINATE_TENTHS_PER_DEGREE) + 0;
}

export function toTuple(
  city: CompiledCity,
  zoneIndex: number,
  regionIndex: number | undefined,
): CityTuple {
  const russian =
    city.names.ru === city.names.en ? NO_RUSSIAN_NAME_MARKER : city.names.ru;
  const base = [
    city.row.geonameId,
    city.names.en,
    russian,
    city.row.countryCode,
    zoneIndex,
    city.row.population,
    toTenths(city.row.latitude),
    toTenths(city.row.longitude),
  ] as const;
  return regionIndex === undefined ? [...base] : [...base, regionIndex];
}
