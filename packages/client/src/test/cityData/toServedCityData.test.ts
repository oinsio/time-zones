// Verifies NFR-P1, M2 of add-geonames-city-source (D1, D5): the served column form.
import { describe, expect, it } from "vitest";
import type { CityDataset } from "../../../scripts/cityData/cityDataTypes.ts";
import { toServedCityData } from "../../../scripts/cityData/toServedCityData.ts";

const DATASET: CityDataset = {
  formatVersion: 1,
  source: { name: "GeoNames", licence: "CC BY 4.0", dumpDate: "2026-11-13" },
  zones: ["Europe/Moscow"],
  regions: [["Illinois", "Иллинойс"]],
  cities: [
    [10, "A", 0, "RU", 0, 100],
    [15, "B", "Б", "US", 0, 200, 0],
  ],
  zoneCityPopulations: { "Europe/Moscow": 5 },
  zoneCityRegions: {},
};

describe("toServedCityData", () => {
  const served = toServedCityData(DATASET);

  it("should drop the source record and the tuples", () => {
    expect(served).not.toHaveProperty("source");
    expect(served).not.toHaveProperty("cities");
  });

  it("should keep the other sections", () => {
    expect(served.zones).toEqual(DATASET.zones);
    expect(served.regions).toEqual(DATASET.regions);
    expect(served.zoneCityPopulations).toEqual(DATASET.zoneCityPopulations);
  });

  it("should store the IDs as differences", () => {
    expect(served.columns.idDifferences).toEqual([10, 5]);
  });

  it("should store one column per field with -1 for no region", () => {
    expect(served.columns).toMatchObject({
      englishNames: ["A", "B"],
      russianNames: [0, "Б"],
      countryCodes: ["RU", "US"],
      zoneIndexes: [0, 0],
      populations: [100, 200],
      regionIndexes: [-1, 0],
    });
  });
});
