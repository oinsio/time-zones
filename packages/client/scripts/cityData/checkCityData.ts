/**
 * Pure validation of the committed city data against the bundled zone rules
 * release and the thresholds of the `city-data` spec; every error names its offender.
 * Implements FR12, M1, M4 of add-geonames-city-source (D8).
 */
import type { ZoneCityRecord } from "../zoneData/extractZoneData.ts";
import type { CityDataset } from "./cityDataTypes.ts";
import {
  COUNTRY_CODE_PATTERN,
  CYRILLIC_PATTERN,
  DATASET_FORMAT_VERSION,
  MIN_CITY_COUNT,
  MIN_CYRILLIC_SHARE,
  NO_RUSSIAN_NAME_MARKER,
  PERCENT_FACTOR,
} from "./constants.ts";
import { findNamesakes, type NamesakeCandidate } from "./markNamesakes.ts";

const CITY_TUPLE_LENGTH_WITHOUT_REGION = 6;
const CITY_TUPLE_LENGTH_WITH_REGION = 7;

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim() !== "";
}

function isNonNegativeInteger(value: unknown): value is number {
  return Number.isInteger(value) && (value as number) >= 0;
}

function checkFormat(value: unknown): string | undefined {
  if (!isObject(value)) return "The city data is not an object";
  if (value.formatVersion !== DATASET_FORMAT_VERSION) {
    return `The city data has the format version ${String(value.formatVersion)}, expected ${DATASET_FORMAT_VERSION}`;
  }
  const hasSource =
    isObject(value.source) &&
    isNonEmptyString(value.source.name) &&
    isNonEmptyString(value.source.licence) &&
    isNonEmptyString(value.source.dumpDate);
  const hasShape =
    hasSource &&
    Array.isArray(value.zones) &&
    value.zones.every(isNonEmptyString) &&
    Array.isArray(value.regions) &&
    value.regions.every(
      (region) =>
        Array.isArray(region) &&
        isNonEmptyString(region[0]) &&
        isNonEmptyString(region[1]),
    ) &&
    Array.isArray(value.cities) &&
    isObject(value.zoneCityPopulations) &&
    isObject(value.zoneCityRegions);
  return hasShape
    ? undefined
    : "The city data does not have the format of design D5";
}

function describeCity(tuple: unknown[]): string {
  return `${String(tuple[1])} (${String(tuple[0])})`;
}

function checkCity(
  tuple: unknown,
  index: number,
  dataset: CityDataset,
  releaseZones: ReadonlySet<string>,
): string[] {
  if (
    !Array.isArray(tuple) ||
    (tuple.length !== CITY_TUPLE_LENGTH_WITHOUT_REGION &&
      tuple.length !== CITY_TUPLE_LENGTH_WITH_REGION)
  ) {
    return [`The city at position ${index} is not a city tuple`];
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
  const errors: string[] = [];
  if (!isNonNegativeInteger(id))
    errors.push(`The city at position ${index} has no GeoNames ID`);
  if (!isNonEmptyString(english))
    errors.push(`The city ${String(id)} has an empty English name`);
  if (russian !== NO_RUSSIAN_NAME_MARKER && !isNonEmptyString(russian)) {
    errors.push(`The city ${describeCity(tuple)} has an empty Russian name`);
  }
  if (!COUNTRY_CODE_PATTERN.test(String(countryCode))) {
    errors.push(
      `The city ${describeCity(tuple)} has the country code ${String(countryCode)}`,
    );
  }
  if (!isNonNegativeInteger(population)) {
    errors.push(
      `The city ${describeCity(tuple)} has the population ${String(population)}`,
    );
  }
  const zone = dataset.zones[zoneIndex as number];
  if (zone === undefined) {
    errors.push(
      `The city ${describeCity(tuple)} has the unknown zone index ${String(zoneIndex)}`,
    );
  } else if (!releaseZones.has(zone)) {
    errors.push(
      `The city ${describeCity(tuple)} is in the zone ${zone}, which the zone rules release does not hold`,
    );
  }
  if (
    regionIndex !== undefined &&
    dataset.regions[regionIndex as number] === undefined
  ) {
    errors.push(
      `The city ${describeCity(tuple)} has the unknown region index ${String(regionIndex)}`,
    );
  }
  return errors;
}

function checkRepeatedIds(cities: unknown[][]): string[] {
  const seen = new Set<unknown>();
  const errors: string[] = [];
  for (const [id] of cities) {
    if (seen.has(id))
      errors.push(`The GeoNames ID ${String(id)} appears twice`);
    seen.add(id);
  }
  return errors;
}

function checkRegions(
  dataset: CityDataset,
  zoneCities: ZoneCityRecord[],
): string[] {
  const candidates: NamesakeCandidate[] = dataset.cities.map((city) => ({
    id: String(city[0]),
    countryCode: city[3],
    names: {
      en: city[1],
      ru: city[2] === NO_RUSSIAN_NAME_MARKER ? city[1] : city[2],
    },
    region: undefined,
  }));
  for (const zoneCity of zoneCities) {
    if (zoneCity.countryCode === "") continue;
    candidates.push({
      id: zoneCity.timeZoneId,
      countryCode: zoneCity.countryCode,
      names: zoneCity.names,
      region: undefined,
    });
  }
  const namesakeIds = new Set(
    findNamesakes(candidates).map((candidate) => candidate.id),
  );
  const errors: string[] = [];
  for (const city of dataset.cities) {
    const isNamesake = namesakeIds.has(String(city[0]));
    const hasRegion = city[6] !== undefined;
    if (isNamesake && !hasRegion)
      errors.push(
        `The city ${describeCity(city)} is a namesake without a region`,
      );
    if (!isNamesake && hasRegion)
      errors.push(
        `The city ${describeCity(city)} has a region but is not a namesake`,
      );
  }
  for (const zoneCity of zoneCities) {
    const isNamesake = namesakeIds.has(zoneCity.timeZoneId);
    const hasRegion = zoneCity.timeZoneId in dataset.zoneCityRegions;
    if (isNamesake && !hasRegion)
      errors.push(
        `The zone city ${zoneCity.timeZoneId} is a namesake without a region`,
      );
  }
  for (const zoneId of Object.keys(dataset.zoneCityRegions)) {
    if (!namesakeIds.has(zoneId))
      errors.push(`The zone city ${zoneId} has a region but is not a namesake`);
  }
  return errors;
}

function checkThresholds(dataset: CityDataset): string[] {
  const errors: string[] = [];
  const cityCount = dataset.cities.length;
  if (cityCount < MIN_CITY_COUNT) {
    errors.push(
      `The city data holds ${cityCount} cities; the minimum is ${MIN_CITY_COUNT}`,
    );
  }
  const cyrillicCount = dataset.cities.filter(
    (city) =>
      city[2] !== NO_RUSSIAN_NAME_MARKER && CYRILLIC_PATTERN.test(city[2]),
  ).length;
  const share = cityCount === 0 ? 0 : cyrillicCount / cityCount;
  if (share < MIN_CYRILLIC_SHARE) {
    errors.push(
      `${Math.round(share * PERCENT_FACTOR)}% of the Russian names are in Cyrillic; the minimum is ${MIN_CYRILLIC_SHARE * PERCENT_FACTOR}%`,
    );
  }
  return errors;
}

/** Returns the errors of the committed object; empty when it is valid. */
export function checkCityData(
  value: unknown,
  releaseZones: ReadonlySet<string>,
  zoneCities: ZoneCityRecord[],
): string[] {
  const formatError = checkFormat(value);
  if (formatError !== undefined) return [formatError];
  const dataset = value as CityDataset;
  const cityErrors = (dataset.cities as unknown[]).flatMap((tuple, index) =>
    checkCity(tuple, index, dataset, releaseZones),
  );
  if (cityErrors.length > 0) return cityErrors;
  return [
    ...checkRepeatedIds(dataset.cities),
    ...checkRegions(dataset, zoneCities),
    ...checkThresholds(dataset),
  ];
}
