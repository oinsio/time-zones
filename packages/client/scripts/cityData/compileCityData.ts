/**
 * Pure compiler: GeoNames rows in, the city data set out. Keeps large cities
 * and capitals, picks names, canonicalizes zones, merges exemplar cities and
 * marks namesakes.
 * Implements FR1, FR2, FR7, FR11, FR12 of add-geonames-city-source (D3, D4, D5, D8).
 */
import { normalizeSearchText } from "../../src/lib/searchText/index.ts";
import type { ZoneCityRecord } from "../zoneData/extractZoneData.ts";
import type {
  Admin1Row,
  AlternateNamesByCity,
  CityDataset,
  CityNames,
  CityTuple,
  GeoNamesCityRow,
} from "./cityDataTypes.ts";
import {
  ADMIN1_KEY_SEPARATOR,
  CAPITAL_FEATURE_CODE,
  DATASET_FORMAT_VERSION,
  GEONAMES_LICENCE,
  GEONAMES_SOURCE_NAME,
  MIN_POPULATION,
  NO_RUSSIAN_NAME_MARKER,
} from "./constants.ts";
import { markNamesakes, type NamesakeCandidate } from "./markNamesakes.ts";
import { selectCityNames } from "./selectCityNames.ts";
import { ZONE_OVERRIDES } from "./zoneOverrides.ts";

export type CityDataInput = {
  cityRows: GeoNamesCityRow[];
  admin1Rows: Admin1Row[];
  alternateNames: AlternateNamesByCity;
  zoneCities: ZoneCityRecord[];
  timeZoneAliases: Record<string, string>;
  releaseZones: ReadonlySet<string>;
  dumpDate: string;
};

type CompiledCity = {
  row: GeoNamesCityRow;
  names: CityNames;
  zoneId: string;
};

/** The cities the data holds: large ones and capitals. */
export function selectLargeCities(rows: GeoNamesCityRow[]): GeoNamesCityRow[] {
  return rows.filter(
    (row) =>
      row.population >= MIN_POPULATION ||
      row.featureCode === CAPITAL_FEATURE_CODE,
  );
}

/** The GeoNames IDs whose alternate names are needed: the cities and their admin1 divisions. */
export function collectWantedIds(
  cityRows: GeoNamesCityRow[],
  admin1Rows: Admin1Row[],
): Set<number> {
  const admin1ByKey = new Map(
    admin1Rows.map((row) => [row.key, row.geonameId]),
  );
  const wantedIds = new Set<number>();
  for (const row of selectLargeCities(cityRows)) {
    wantedIds.add(row.geonameId);
    const admin1Id = admin1ByKey.get(toAdmin1Key(row));
    if (admin1Id !== undefined) wantedIds.add(admin1Id);
  }
  return wantedIds;
}

function toAdmin1Key(row: GeoNamesCityRow): string {
  return `${row.countryCode}${ADMIN1_KEY_SEPARATOR}${row.admin1Code}`;
}

function resolveZone(row: GeoNamesCityRow, input: CityDataInput): string {
  const zoneId = ZONE_OVERRIDES[row.timeZoneId] ?? row.timeZoneId;
  const canonicalZoneId = input.timeZoneAliases[zoneId] ?? zoneId;
  if (!input.releaseZones.has(canonicalZoneId)) {
    throw new Error(
      `The city ${row.name} (${row.geonameId}) is in the zone ${row.timeZoneId}, which the zone rules release does not hold`,
    );
  }
  return canonicalZoneId;
}

function namesOverlap(left: CityNames, right: CityNames): boolean {
  const leftTexts = [left.en, left.ru].map(normalizeSearchText);
  return [right.en, right.ru]
    .map(normalizeSearchText)
    .some((text) => leftTexts.includes(text));
}

function isExemplarCityOf(zoneCity: ZoneCityRecord, city: CompiledCity) {
  return (
    zoneCity.timeZoneId === city.zoneId &&
    zoneCity.countryCode === city.row.countryCode &&
    namesOverlap(zoneCity.names, city.names)
  );
}

function readRegionNames(
  admin1: Admin1Row | undefined,
  input: CityDataInput,
): CityNames | undefined {
  if (admin1 === undefined) return undefined;
  const alternates = input.alternateNames.get(admin1.geonameId) ?? [];
  const names = selectCityNames(admin1, alternates, {});
  return { en: admin1.name, ru: names.ru };
}

function toTuple(
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
  ] as const;
  return regionIndex === undefined ? [...base] : [...base, regionIndex];
}

export function compileCityData(input: CityDataInput): CityDataset {
  const admin1ByKey = new Map(input.admin1Rows.map((row) => [row.key, row]));
  const compiled: CompiledCity[] = selectLargeCities(input.cityRows)
    .sort((left, right) => left.geonameId - right.geonameId)
    .map((row) => ({
      row,
      names: selectCityNames(
        row,
        input.alternateNames.get(row.geonameId) ?? [],
      ),
      zoneId: resolveZone(row, input),
    }));

  const zoneCityPopulations: Record<string, number> = {};
  const zoneCityMatches = new Map<string, CompiledCity>();
  const emitted: CompiledCity[] = [];
  for (const city of compiled) {
    const zoneCity = input.zoneCities.find((record) =>
      isExemplarCityOf(record, city),
    );
    if (zoneCity === undefined) {
      emitted.push(city);
      continue;
    }
    const known = zoneCityPopulations[zoneCity.timeZoneId] ?? 0;
    zoneCityPopulations[zoneCity.timeZoneId] = Math.max(
      known,
      city.row.population,
    );
    if (!zoneCityMatches.has(zoneCity.timeZoneId)) {
      zoneCityMatches.set(zoneCity.timeZoneId, city);
    }
  }

  const candidates: NamesakeCandidate[] = emitted.map((city) => ({
    id: String(city.row.geonameId),
    countryCode: city.row.countryCode,
    names: city.names,
    region: readRegionNames(admin1ByKey.get(toAdmin1Key(city.row)), input),
  }));
  for (const zoneCity of input.zoneCities) {
    if (zoneCity.countryCode === "") continue;
    const match = zoneCityMatches.get(zoneCity.timeZoneId);
    candidates.push({
      id: zoneCity.timeZoneId,
      countryCode: zoneCity.countryCode,
      names: zoneCity.names,
      region:
        match &&
        readRegionNames(admin1ByKey.get(toAdmin1Key(match.row)), input),
    });
  }
  const { regions, regionIndexById } = markNamesakes(candidates);

  const zones = [...new Set(emitted.map((city) => city.zoneId))].sort();
  const zoneCityRegions: Record<string, number> = {};
  for (const zoneCity of input.zoneCities) {
    const regionIndex = regionIndexById.get(zoneCity.timeZoneId);
    if (regionIndex !== undefined)
      zoneCityRegions[zoneCity.timeZoneId] = regionIndex;
  }
  return {
    formatVersion: DATASET_FORMAT_VERSION,
    source: {
      name: GEONAMES_SOURCE_NAME,
      licence: GEONAMES_LICENCE,
      dumpDate: input.dumpDate,
    },
    zones,
    regions,
    cities: emitted.map((city) =>
      toTuple(
        city,
        zones.indexOf(city.zoneId),
        regionIndexById.get(String(city.row.geonameId)),
      ),
    ),
    zoneCityPopulations,
    zoneCityRegions,
  };
}
