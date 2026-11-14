// Verifies FR7, FR2 of add-geonames-city-source (D8): the alternate names the compiler asks for, and its branch edges.
import { describe, expect, it } from "vitest";
import {
  collectWantedIds,
  compileCityData,
} from "../../../scripts/cityData/compileCityData.ts";
import {
  ADMIN1_ROWS,
  buildInput,
  cityRow,
  russianName,
} from "./compileCityData.fixtures.ts";

describe("collectWantedIds", () => {
  it("should hold a selected city and the admin1 division of its country and code", () => {
    const wantedIds = collectWantedIds(
      [cityRow({ geonameId: 1, countryCode: "US", admin1Code: "IL" })],
      ADMIN1_ROWS,
    );
    expect([...wantedIds].sort()).toEqual([1, 9002]);
  });

  it("should not hold the admin1 division of a city below the threshold", () => {
    const wantedIds = collectWantedIds(
      [cityRow({ geonameId: 1, population: 10 })],
      ADMIN1_ROWS,
    );
    expect([...wantedIds]).toEqual([]);
  });

  it("should hold only the city when its admin1 key has no row", () => {
    const wantedIds = collectWantedIds(
      [cityRow({ geonameId: 1, admin1Code: "99" })],
      ADMIN1_ROWS,
    );
    expect([...wantedIds]).toEqual([1]);
  });
});

describe("compileCityData branch edges", () => {
  it("should compile with admin1 rows only and no alternate names", () => {
    const dataset = compileCityData(
      buildInput({ cityRows: [cityRow({ geonameId: 1, name: "Kazan" })] }),
    );
    expect(dataset.cities[0].slice(1, 3)).toEqual(["Kazan", 0]);
  });

  it("should keep the first city that matches a zone city", () => {
    const dataset = compileCityData(
      buildInput({
        cityRows: [
          cityRow({
            geonameId: 5,
            name: "Moscow",
            population: 1_000_000,
            admin1Code: "01",
          }),
          cityRow({
            geonameId: 6,
            name: "Moscow",
            population: 2_000_000,
            admin1Code: "02",
          }),
          cityRow({
            geonameId: 7,
            name: "Moscow",
            countryCode: "RU",
            admin1Code: "01",
            timeZoneId: "Europe/Berlin",
          }),
        ],
        alternateNames: new Map([[9001, [russianName(9001, "Регион")]]]),
      }),
    );
    expect(dataset.zoneCityPopulations).toEqual({
      "Europe/Moscow": 2_000_000,
    });
    expect(dataset.zoneCityRegions).toEqual({ "Europe/Moscow": 0 });
  });

  it("should skip zone cities without a country code, so equal names are no namesakes", () => {
    const dataset = compileCityData(
      buildInput({
        zoneCities: ["Europe/Berlin", "Asia/Kolkata"].map((timeZoneId) => ({
          timeZoneId,
          names: { en: "Twin", ru: "Twin" },
          countryCode: "",
        })),
      }),
    );
    expect(dataset.zoneCityRegions).toStrictEqual({});
  });

  it("should give no zoneCityRegions entry to a zone city without a region", () => {
    const dataset = compileCityData(buildInput({}));
    expect(dataset.zoneCityRegions).toStrictEqual({});
  });
});
