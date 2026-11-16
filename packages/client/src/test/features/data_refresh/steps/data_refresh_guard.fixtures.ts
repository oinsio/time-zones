// Verifies FR2 of refresh-data-through-scheduled-pull-requests: fixtures of the refresh guard steps.
import type {
  CityDataset,
  CityTuple,
} from "../../../../../scripts/cityData/cityDataTypes.ts";

export const COMMITTED_CITY_COUNT = 6000;
export const SMALL_POPULATION = 150_000;
export const LARGE_POPULATION = 1_200_000;
const ZONES = ["Europe/Paris", "Asia/Almaty"];
const ALMATY_INDEX = 1;
export const LARGE_CITY_ID = COMMITTED_CITY_COUNT - 1;
export const ALMATY_CITY_ID = COMMITTED_CITY_COUNT;

export function buildCities(count: number, firstId = 1): CityTuple[] {
  return Array.from({ length: count }, (_, index) => [
    firstId + index,
    `City ${firstId + index}`,
    0,
    "XX",
    0,
    SMALL_POPULATION,
    10,
    20,
  ]);
}

export function buildDataset(
  cities: CityTuple[],
  dumpDate: string,
): CityDataset {
  return {
    formatVersion: 1,
    source: { name: "GeoNames", licence: "CC BY 4.0", dumpDate },
    zones: ZONES,
    regions: [],
    cities,
    zoneCityPopulations: {},
    zoneCityRegions: {},
  };
}

export function buildCommittedCities(): CityTuple[] {
  return [
    ...buildCities(COMMITTED_CITY_COUNT - 2),
    [LARGE_CITY_ID, "Large", 0, "XX", 0, LARGE_POPULATION, 10, 20],
    [ALMATY_CITY_ID, "Almaty", 0, "KZ", ALMATY_INDEX, SMALL_POPULATION, 10, 20],
  ];
}

export const releaseOf = (ids: string[]) => ({
  zones: Object.fromEntries(ids.map((id) => [id, {}])),
});
