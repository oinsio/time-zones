import type { CityNameLanguage } from "@/constants";
import type { GeoNamesCityData, GeoNamesCityEntry } from "./citySource";

/**
 * Validates the `cityData` section of the search data file (design D5) and
 * expands its tuples: a Russian name of `0` becomes the English name, region
 * and zone indexes become their names. Returns `undefined` when it is invalid.
 * Implements FR14 of add-geonames-city-source (D5).
 */

const NO_RUSSIAN_NAME_MARKER = 0;
const TUPLE_LENGTH_WITHOUT_REGION = 6;
const TUPLE_LENGTH_WITH_REGION = 7;
const REGION_NAME_COUNT = 2;

type Names = Record<CityNameLanguage, string>;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);
const isString = (value: unknown): value is string => typeof value === "string";
const isIndexInto = (
  value: unknown,
  list: readonly unknown[],
): value is number =>
  Number.isInteger(value) && list[value as number] !== undefined;

function readRegions(value: unknown): Names[] | undefined {
  if (!Array.isArray(value)) return undefined;
  const regions: Names[] = [];
  for (const entry of value) {
    if (
      !Array.isArray(entry) ||
      entry.length !== REGION_NAME_COUNT ||
      !entry.every(isString)
    ) {
      return undefined;
    }
    regions.push({ en: entry[0], ru: entry[1] });
  }
  return regions;
}

function readCity(
  tuple: unknown,
  zones: readonly string[],
  regions: readonly Names[],
): GeoNamesCityEntry | undefined {
  if (
    !Array.isArray(tuple) ||
    (tuple.length !== TUPLE_LENGTH_WITHOUT_REGION &&
      tuple.length !== TUPLE_LENGTH_WITH_REGION)
  ) {
    return undefined;
  }
  const [
    id,
    english,
    russian,
    countryCode,
    zoneIndex,
    population,
    regionIndex,
  ] = tuple;
  const isValid =
    Number.isInteger(id) &&
    isString(english) &&
    (russian === NO_RUSSIAN_NAME_MARKER || isString(russian)) &&
    isString(countryCode) &&
    isIndexInto(zoneIndex, zones) &&
    Number.isInteger(population) &&
    (regionIndex === undefined || isIndexInto(regionIndex, regions));
  if (!isValid) return undefined;
  return {
    id: String(id),
    names: {
      en: english,
      ru: russian === NO_RUSSIAN_NAME_MARKER ? english : russian,
    },
    countryCode,
    timeZoneId: zones[zoneIndex] as string,
    population,
    ...(regionIndex === undefined ? {} : { region: regions[regionIndex] }),
  };
}

function readZoneCityRegions(
  value: unknown,
  regions: readonly Names[],
): Record<string, Names> | undefined {
  if (!isRecord(value)) return undefined;
  const zoneCityRegions: Record<string, Names> = {};
  for (const [zoneId, regionIndex] of Object.entries(value)) {
    if (!isIndexInto(regionIndex, regions)) return undefined;
    zoneCityRegions[zoneId] = regions[regionIndex] as Names;
  }
  return zoneCityRegions;
}

export function parseGeoNamesCityData(
  payload: unknown,
): GeoNamesCityData | undefined {
  if (!isRecord(payload)) return undefined;
  const { zones, cities, zoneCityPopulations } = payload;
  const regions = readRegions(payload.regions);
  if (
    !Array.isArray(zones) ||
    !zones.every(isString) ||
    regions === undefined ||
    !Array.isArray(cities) ||
    !isRecord(zoneCityPopulations) ||
    !Object.values(zoneCityPopulations).every(Number.isInteger)
  ) {
    return undefined;
  }
  const zoneCityRegions = readZoneCityRegions(payload.zoneCityRegions, regions);
  const entries = cities.map((tuple) => readCity(tuple, zones, regions));
  if (
    zoneCityRegions === undefined ||
    entries.some((entry) => entry === undefined)
  ) {
    return undefined;
  }
  return {
    cities: entries as GeoNamesCityEntry[],
    zoneCityPopulations: zoneCityPopulations as Record<string, number>,
    zoneCityRegions,
  };
}
