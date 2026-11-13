// Verifies FR1, FR11, FR12 of add-geonames-city-source (D3, D8).
import { describe, expect, it } from "vitest";
import { compileCityData } from "../../../scripts/cityData/compileCityData.ts";
import {
  buildInput,
  cityRow,
  russianName,
} from "./compileCityData.fixtures.ts";

describe("compileCityData selection", () => {
  it("should keep a city at the population threshold and drop 99 999", () => {
    const dataset = compileCityData(
      buildInput({
        cityRows: [
          cityRow({ geonameId: 1, name: "Big", population: 100_000 }),
          cityRow({ geonameId: 2, name: "Small", population: 99_999 }),
        ],
      }),
    );
    expect(dataset.cities.map(([id]) => id)).toEqual([1]);
  });

  it("should keep a capital below the threshold", () => {
    const dataset = compileCityData(
      buildInput({
        cityRows: [
          cityRow({ geonameId: 3, featureCode: "PPLC", population: 500 }),
        ],
      }),
    );
    expect(dataset.cities).toHaveLength(1);
  });

  it("should sort cities by GeoNames ID", () => {
    const dataset = compileCityData(
      buildInput({
        cityRows: [cityRow({ geonameId: 30 }), cityRow({ geonameId: 5 })],
      }),
    );
    expect(dataset.cities.map(([id]) => id)).toEqual([5, 30]);
  });

  it("should store an equal Russian name as 0", () => {
    const dataset = compileCityData(
      buildInput({ cityRows: [cityRow({ geonameId: 4, name: "Kazan" })] }),
    );
    expect(dataset.cities[0].slice(1, 3)).toEqual(["Kazan", 0]);
  });

  it("should store a different Russian name", () => {
    const dataset = compileCityData(
      buildInput({
        cityRows: [cityRow({ geonameId: 4, name: "Kazan" })],
        alternateNames: new Map([[4, [russianName(4, "Казань")]]]),
      }),
    );
    expect(dataset.cities[0].slice(1, 3)).toEqual(["Kazan", "Казань"]);
  });

  it("should record the source and the format", () => {
    const dataset = compileCityData(buildInput({}));
    expect(dataset.source).toEqual({
      name: "GeoNames",
      licence: "CC BY 4.0",
      dumpDate: "2026-11-13",
    });
    expect(dataset.formatVersion).toBe(1);
  });

  it("should give identical output for two runs", () => {
    const input = buildInput({
      cityRows: [cityRow({ geonameId: 2 }), cityRow({ geonameId: 1 })],
    });
    expect(JSON.stringify(compileCityData(input))).toBe(
      JSON.stringify(compileCityData(input)),
    );
  });
});

describe("compileCityData zones", () => {
  it("should canonicalize an alias", () => {
    const dataset = compileCityData(
      buildInput({
        cityRows: [cityRow({ geonameId: 6, timeZoneId: "Asia/Calcutta" })],
      }),
    );
    expect(dataset.zones).toEqual(["Asia/Kolkata"]);
    expect(dataset.cities[0][4]).toBe(0);
  });

  it("should list used zones sorted and index them", () => {
    const dataset = compileCityData(
      buildInput({
        cityRows: [
          cityRow({ geonameId: 1, timeZoneId: "Europe/Moscow" }),
          cityRow({ geonameId: 2, timeZoneId: "Asia/Kolkata" }),
        ],
      }),
    );
    expect(dataset.zones).toEqual(["Asia/Kolkata", "Europe/Moscow"]);
    expect(dataset.cities.map((city) => city[4])).toEqual([1, 0]);
  });

  it("should throw naming the city and the zone for a zone outside the release", () => {
    expect(() =>
      compileCityData(
        buildInput({
          cityRows: [
            cityRow({
              geonameId: 7,
              name: "Olympus",
              timeZoneId: "Mars/Olympus",
            }),
          ],
        }),
      ),
    ).toThrow(/Olympus.*Mars\/Olympus/);
  });
});

describe("compileCityData exemplar cities", () => {
  const moscow = cityRow({
    geonameId: 524901,
    name: "Moscow",
    featureCode: "PPLC",
    population: 10_381_222,
  });

  it("should merge the exemplar city into zoneCityPopulations and not emit it", () => {
    const dataset = compileCityData(
      buildInput({
        cityRows: [moscow, cityRow({ geonameId: 551487, name: "Kazan" })],
      }),
    );
    expect(dataset.zoneCityPopulations).toEqual({
      "Europe/Moscow": 10_381_222,
    });
    expect(dataset.cities.map(([id]) => id)).toEqual([551487]);
  });

  it("should match the exemplar city by its Russian name", () => {
    const dataset = compileCityData(
      buildInput({
        cityRows: [cityRow({ ...moscow, name: "Moskva" })],
        alternateNames: new Map([[524901, [russianName(524901, "москва")]]]),
      }),
    );
    expect(dataset.cities).toHaveLength(0);
  });

  it("should not merge a city of another country", () => {
    const dataset = compileCityData(
      buildInput({ cityRows: [cityRow({ ...moscow, countryCode: "US" })] }),
    );
    expect(dataset.cities).toHaveLength(1);
    expect(dataset.zoneCityPopulations).toEqual({});
  });
});

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
    expect(dataset.cities.map((city) => city[6])).toEqual([0, 1]);
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
    expect(dataset.cities[0][6]).toBe(0);
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
    expect(dataset.cities.every((city) => city.length === 6)).toBe(true);
    expect(dataset.regions).toEqual([]);
  });
});
