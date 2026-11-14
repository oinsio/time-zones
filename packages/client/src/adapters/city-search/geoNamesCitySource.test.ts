// Verifies FR3, FR11 of add-geonames-city-source (D6): the GeoNames city source.
import { describe, expect, it } from "vitest";
import { SearchMatchKind } from "@/ports";
import { startWorkCount } from "@/test/workCounters";
import type { GeoNamesCityData, GeoNamesCityEntry } from "./citySource";
import { createGeoNamesCitySource } from "./geoNamesCitySource";

const KAZAN: GeoNamesCityEntry = {
  id: "551487",
  names: { en: "Kazan", ru: "Казань" },
  countryCode: "RU",
  timeZoneId: "Europe/Moscow",
  population: 1_243_500,
};
const SPRINGFIELD: GeoNamesCityEntry = {
  id: "4250542",
  names: { en: "Springfield", ru: "Спрингфилд" },
  countryCode: "US",
  timeZoneId: "America/Chicago",
  population: 114_394,
  region: { en: "Illinois", ru: "Иллинойс" },
};
const MARS: GeoNamesCityEntry = {
  id: "1",
  names: { en: "Olympus", ru: "Олимп" },
  countryCode: "RU",
  timeZoneId: "Mars/Olympus",
  population: 5,
};
const cityData: GeoNamesCityData = {
  cities: [KAZAN, SPRINGFIELD, MARS],
  zoneCityPopulations: {},
  zoneCityRegions: {},
};
const listZones = () => ["Europe/Moscow", "America/Chicago"];

describe("GeoNames city source records", () => {
  const { records } = createGeoNamesCitySource(cityData, listZones);

  it("should carry the GeoNames ID as the record ID", () => {
    expect(records.map((record) => record.id)).toEqual(["551487", "4250542"]);
  });

  it("should carry rank 0, the population and the region", () => {
    expect(records[1]).toMatchObject({
      rank: 0,
      population: 114_394,
      region: { en: "Illinois", ru: "Иллинойс" },
      timeZoneId: "America/Chicago",
      countryCode: "US",
      names: SPRINGFIELD.names,
    });
  });

  it("should carry no region for a city without one", () => {
    expect(records[0]).not.toHaveProperty("region");
  });

  it("should skip a city whose zone is not in the listed zones", () => {
    expect(records.some((record) => record.timeZoneId === "Mars/Olympus")).toBe(
      false,
    );
  });

  it("should keep every city when no zone list is known", () => {
    const source = createGeoNamesCitySource(cityData, () => undefined);
    expect(source.records).toHaveLength(3);
  });

  it("should carry no abbreviation aliases", () => {
    expect(records[0]?.aliases).toEqual([]);
  });
});

describe("GeoNames city source matching", () => {
  const source = createGeoNamesCitySource(cityData, listZones);
  const match = (query: string) =>
    source.match(query).map((result) => [result.record.id, result.matchKind]);

  it.each([
    ["kaz", [["551487", SearchMatchKind.CITY_PREFIX]]],
    ["казан", [["551487", SearchMatchKind.CITY_PREFIX]]],
    ["field", []],
    ["spring", [["4250542", SearchMatchKind.CITY_PREFIX]]],
    ["russia", [["551487", SearchMatchKind.COUNTRY]]],
    ["россия", [["551487", SearchMatchKind.COUNTRY]]],
    ["qqqq", []],
  ])("should match %j", (query, expected) => {
    expect(match(query)).toEqual(expected);
  });

  it("should match a later word of the name", () => {
    const source = createGeoNamesCitySource(
      {
        ...cityData,
        cities: [{ ...KAZAN, names: { en: "Nizhny Kazan", ru: "Нижний" } }],
      },
      listZones,
    );
    expect(source.match("kaz")[0]?.matchKind).toBe(
      SearchMatchKind.CITY_WORD_PREFIX,
    );
  });

  it("should normalize nothing when built, only on the first match", () => {
    const workCount = startWorkCount();
    try {
      const fresh = createGeoNamesCitySource(cityData, listZones);
      expect(workCount.normalizations()).toBe(0);
      fresh.match("kaz");
      expect(workCount.normalizations()).toBeGreaterThan(0);
    } finally {
      workCount.stop();
    }
  });
});
