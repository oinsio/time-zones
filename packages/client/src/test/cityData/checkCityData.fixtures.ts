import type {
  CityDataset,
  CityTuple,
} from "../../../scripts/cityData/cityDataTypes.ts";

export const RELEASE_ZONES = new Set(["Europe/Berlin", "Europe/Moscow"]);
const VALID_CITY_COUNT = 6000;

export function buildCity(
  index: number,
  overrides: Partial<{ russian: string | 0; english: string }> = {},
): CityTuple {
  return [
    index,
    overrides.english ?? `Town${index}`,
    overrides.russian ?? `Город${index}`,
    "DE",
    0,
    100_000 + index,
  ];
}

export function buildDataset(cities: CityTuple[] = []): CityDataset {
  const filler = Array.from({ length: VALID_CITY_COUNT }, (_, index) =>
    buildCity(index + 1),
  );
  return {
    formatVersion: 1,
    source: { name: "GeoNames", licence: "CC BY 4.0", dumpDate: "2026-11-13" },
    zones: ["Europe/Berlin"],
    regions: [["Illinois", "Иллинойс"]],
    cities: [...filler, ...cities],
    zoneCityPopulations: {},
    zoneCityRegions: {},
  };
}
