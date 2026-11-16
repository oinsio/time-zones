// Verifies FR2, FR7 of refresh-data-through-scheduled-pull-requests.
import { describe, expect, it } from "vitest";
import type {
  CityDataset,
  CityTuple,
} from "../../../scripts/cityData/cityDataTypes.ts";
import { compareCityData } from "../../../scripts/dataRefresh/compareCityData.ts";

function city(
  geonameId: number,
  zoneIndex: number,
  population: number,
  name = `City ${geonameId}`,
): CityTuple {
  return [geonameId, name, 0, "XX", zoneIndex, population, 10, 20];
}

function dataset(cities: CityTuple[], dumpDate = "2026-11-14"): CityDataset {
  return {
    formatVersion: 1,
    source: { name: "GeoNames", licence: "CC BY 4.0", dumpDate },
    zones: ["Europe/Paris", "Asia/Almaty"],
    regions: [],
    cities,
    zoneCityPopulations: {},
    zoneCityRegions: {},
  };
}

const committed = dataset([
  city(1, 0, 200_000),
  city(2, 1, 3_000_000),
  city(3, 0, 150_000),
]);

describe("compareCityData", () => {
  it("treats files that differ only in the dump date as the same data", () => {
    const refreshed = dataset(committed.cities, "2026-12-02");
    expect(compareCityData(committed, refreshed).isSameData).toBe(true);
  });

  it.each([
    [
      "a changed name",
      [
        city(1, 0, 200_000, "Renamed"),
        committed.cities[1],
        committed.cities[2],
      ],
    ],
    [
      "a changed zone",
      [city(1, 1, 200_000), committed.cities[1], committed.cities[2]],
    ],
    [
      "a changed population",
      [city(1, 0, 200_001), committed.cities[1], committed.cities[2]],
    ],
    [
      "a changed coordinate",
      [
        [1, "City 1", 0, "XX", 0, 200_000, 11, 20] as CityTuple,
        committed.cities[1],
        committed.cities[2],
      ],
    ],
    [
      "a changed region",
      [
        [1, "City 1", 0, "XX", 0, 200_000, 10, 20, 0] as CityTuple,
        committed.cities[1],
        committed.cities[2],
      ],
    ],
    ["a changed city count", [...committed.cities, city(4, 0, 100_000)]],
  ])("sees %s as different data", (_label, cities) => {
    const refreshed = dataset(cities, "2026-12-02");
    expect(compareCityData(committed, refreshed).isSameData).toBe(false);
  });

  it("lists removed cities by GeoNames id", () => {
    const refreshed = dataset([committed.cities[0]]);
    expect(compareCityData(committed, refreshed).removedCities).toEqual([2, 3]);
  });

  it("gives the removed share against the committed count", () => {
    const refreshed = dataset([committed.cities[0], committed.cities[1]]);
    expect(compareCityData(committed, refreshed).removedShare).toBeCloseTo(
      1 / 3,
    );
  });

  it("gives a zero share without removals", () => {
    expect(compareCityData(committed, committed).removedShare).toBe(0);
  });

  it("gives a zero share for an empty committed dataset", () => {
    expect(compareCityData(dataset([]), dataset([])).removedShare).toBe(0);
  });

  it("lists removed cities at the large population threshold", () => {
    const refreshed = dataset([committed.cities[0]]);
    expect(compareCityData(committed, refreshed).removedLargeCities).toEqual([
      2,
    ]);
  });

  it("includes a removed city of exactly 1 000 000 inhabitants", () => {
    const exact = dataset([city(9, 0, 1_000_000)]);
    expect(compareCityData(exact, dataset([])).removedLargeCities).toEqual([9]);
  });

  it("does not list a removed city just below the threshold", () => {
    const below = dataset([city(9, 0, 999_999)]);
    expect(compareCityData(below, dataset([])).removedLargeCities).toEqual([]);
  });

  it("lists zones the committed cities used and the refreshed ones do not", () => {
    const refreshed = dataset([city(1, 0, 200_000), city(3, 0, 150_000)]);
    expect(compareCityData(committed, refreshed).removedZones).toEqual([
      "Asia/Almaty",
    ]);
  });

  it("matches a zone by identifier, not by index", () => {
    const refreshed = {
      ...dataset([city(1, 0, 1), city(2, 1, 1)]),
      zones: ["Asia/Almaty", "Europe/Paris"],
    };
    expect(compareCityData(committed, refreshed).removedZones).toEqual([]);
  });
});
