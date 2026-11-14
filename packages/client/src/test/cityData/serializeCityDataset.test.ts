// Verifies FR12 of add-geonames-city-source (D5): compact, deterministic serialization.
import { describe, expect, it } from "vitest";
import type { CityDataset } from "../../../scripts/cityData/cityDataTypes.ts";
import { serializeCityDataset } from "../../../scripts/cityData/serializeCityDataset.ts";

const DATASET: CityDataset = {
  formatVersion: 1,
  source: { name: "GeoNames", licence: "CC BY 4.0", dumpDate: "2026-11-13" },
  zones: ["Europe/Moscow"],
  regions: [["Illinois", "Иллинойс"]],
  cities: [
    [1, "A", 0, "RU", 0, 100000],
    [2, "B", "Б", "RU", 0, 200000, 0],
  ],
  zoneCityPopulations: { "Europe/Moscow": 5 },
  zoneCityRegions: {},
};

describe("serializeCityDataset", () => {
  it("should round-trip through JSON.parse", () => {
    expect(JSON.parse(serializeCityDataset(DATASET))).toEqual(DATASET);
  });

  it("should write one city per line", () => {
    const lines = serializeCityDataset(DATASET).split("\n");
    expect(lines).toContain('[1,"A",0,"RU",0,100000],');
    expect(lines).toContain('[2,"B","Б","RU",0,200000,0]');
  });

  it("should end with a newline", () => {
    expect(serializeCityDataset(DATASET).endsWith("}\n")).toBe(true);
  });
});
