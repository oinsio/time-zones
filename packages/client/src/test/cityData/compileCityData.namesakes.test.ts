// Verifies FR1, FR11, FR12 of add-geonames-city-source (D3, D8).
// Verifies FR1 of add-city-coordinates-to-locations (D2).
import { describe, expect, it } from "vitest";
import { compileCityData } from "../../../scripts/cityData/compileCityData.ts";
import {
  buildInput,
  cityRow,
  russianName,
} from "./compileCityData.fixtures.ts";

describe("compileCityData namesakes", () => {
  it("should give three namesakes their regions", () => {
    const dataset = compileCityData(
      buildInput({
        cityRows: [
          cityRow({
            geonameId: 1,
            name: "Springfield",
            countryCode: "US",
            admin1Code: "IL",
            timeZoneId: "America/Chicago",
          }),
          cityRow({
            geonameId: 2,
            name: "Springfield",
            countryCode: "US",
            admin1Code: "MO",
            timeZoneId: "America/Chicago",
          }),
        ],
        alternateNames: new Map([[9002, [russianName(9002, "Иллинойс")]]]),
      }),
    );
    expect(dataset.regions).toEqual([
      ["Illinois", "Иллинойс"],
      ["Missouri", "Missouri"],
    ]);
    expect(dataset.cities.map((city) => city[8])).toEqual([0, 1]);
  });

  it("should give a zone city that is a namesake its region", () => {
    const dataset = compileCityData(
      buildInput({
        cityRows: [
          cityRow({
            geonameId: 524901,
            name: "Moscow",
            featureCode: "PPLC",
            population: 10_000_000,
            admin1Code: "01",
          }),
          cityRow({
            geonameId: 99,
            name: "Moscow",
            countryCode: "RU",
            admin1Code: "01",
            timeZoneId: "Europe/Berlin",
          }),
        ],
        alternateNames: new Map([
          [524901, [russianName(524901, "Москва")]],
          [99, [russianName(99, "Москва")]],
        ]),
      }),
    );
    expect(dataset.zoneCityRegions).toEqual({ "Europe/Moscow": 0 });
    expect(dataset.cities[0][8]).toBe(0);
  });

  it("should leave cities of different countries without a region", () => {
    const dataset = compileCityData(
      buildInput({
        cityRows: [
          cityRow({
            geonameId: 1,
            name: "Victoria",
            countryCode: "US",
            admin1Code: "IL",
          }),
          cityRow({ geonameId: 2, name: "Victoria", countryCode: "RU" }),
        ],
        timeZoneAliases: {},
      }),
    );
    expect(dataset.cities.every((city) => city.length === 8)).toBe(true);
    expect(dataset.regions).toEqual([]);
  });
});

describe("compileCityData coordinates", () => {
  // @add-city-coordinates-to-locations @FR1
  it.each([
    ["Kazan", 55.78874, 49.12214, 558, 491],
    ["Quito", -0.22985, -78.52495, -2, -785],
    ["Null Island", -0.04, 0.04, 0, 0],
  ])(
    "should round %s to tenths of a degree",
    (name, latitude, longitude, latitudeTenths, longitudeTenths) => {
      const dataset = compileCityData(
        buildInput({
          cityRows: [cityRow({ geonameId: 7, name, latitude, longitude })],
        }),
      );
      expect(dataset.cities[0].slice(6, 8)).toEqual([
        latitudeTenths,
        longitudeTenths,
      ]);
    },
  );

  it("should write a zero, never a negative zero", () => {
    const dataset = compileCityData(
      buildInput({
        cityRows: [
          cityRow({ geonameId: 7, latitude: -0.04, longitude: -0.04 }),
        ],
      }),
    );
    expect(Object.is(dataset.cities[0][6], 0)).toBe(true);
    expect(Object.is(dataset.cities[0][7], 0)).toBe(true);
  });
});
