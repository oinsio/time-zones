// Verifies FR15, FR16, NFR-P2 of add-locations-via-search (D8); FR14 of add-geonames-city-source (D5).
// Verifies FR5 of add-city-coordinates-to-locations (D2, D5): coordinates are decoded from tenths.
import { describe, expect, it } from "vitest";
import { parseCitySearchData } from "./fetchCitySearch";
import {
  parse,
  validCityData,
  validRecord,
} from "./fetchCitySearch.parse.fixtures";

const INVALID_RECORDS_MESSAGE = "not a list of zone cities";

describe("parse city search data lists", () => {
  it("should expand the zone city populations and regions", () => {
    const { cityData: parsed } = parse();
    expect(parsed.zoneCityPopulations).toEqual({ "Europe/Moscow": 10381222 });
    expect(parsed.zoneCityRegions).toEqual({
      "Europe/Moscow": { en: "Illinois", ru: "Иллинойс" },
    });
  });

  it.each([
    ["a non-object payload", null],
    ["a missing zone cities list", { cityData: validCityData }],
    ["a missing city data section", { zoneCities: [validRecord] }],
    ["an invalid zone city", { zoneCities: [null], cityData: validCityData }],
  ])("should reject %s", (_label, payload) => {
    expect(() => parseCitySearchData(payload)).toThrow(INVALID_RECORDS_MESSAGE);
  });

  it.each([
    ["a missing columns section", { columns: undefined }],
    [
      "a missing column",
      { columns: { ...validCityData.columns, populations: undefined } },
    ],
    [
      "columns of different lengths",
      { columns: { ...validCityData.columns, populations: [1] } },
    ],
    [
      "a non-numeric ID difference",
      { columns: { ...validCityData.columns, idDifferences: ["x", 1] } },
    ],
    ["a bad tuple", { cities: [[1, 5, "А", "RU", 0, 1, 1, 1]] }],
    ["a bad Russian name", { cities: [[1, "A", 5, "RU", 0, 1, 1, 1]] }],
    [
      "a zone index out of range",
      { cities: [[1, "A", "А", "RU", 9, 1, 1, 1]] },
    ],
    [
      "a region index out of range",
      { cities: [[1, "A", "А", "RU", 0, 1, 1, 1, 9]] },
    ],
    [
      "a non-numeric population",
      { cities: [[1, "A", "А", "RU", 0, "1", 1, 1]] },
    ],
    [
      "a latitude of 91 degrees",
      { cities: [[1, "A", "А", "RU", 0, 1, 910, 0]] },
    ],
    [
      "a longitude of -181 degrees",
      { cities: [[1, "A", "А", "RU", 0, 1, 0, -1810]] },
    ],
    ["a non-numeric latitude", { cities: [[1, "A", "А", "RU", 0, 1, "1", 0]] }],
    ["a missing longitude", { cities: [[1, "A", "А", "RU", 0, 1, 1]] }],
    ["a bad zones list", { zones: [1] }],
    ["a bad region", { regions: [["Illinois"]] }],
    ["a non-array regions list", { regions: {} }],
    ["a bad zone city population", { zoneCityPopulations: { x: "1" } }],
    ["a zone city region out of range", { zoneCityRegions: { x: 9 } }],
    ["a non-object zone city regions", { zoneCityRegions: [] }],
  ])("should reject %s", (_label, overrides) => {
    expect(() => parse(overrides)).toThrow(INVALID_RECORDS_MESSAGE);
  });

  it("should reject a list with one invalid record among valid ones", () => {
    expect(() =>
      parseCitySearchData({
        zoneCities: [validRecord, null],
        cityData: validCityData,
      }),
    ).toThrow(INVALID_RECORDS_MESSAGE);
  });

  it.each([
    ["a record without an id", { ...validRecord, timeZoneId: undefined }],
    ["a record with a numeric id", { ...validRecord, timeZoneId: 1 }],
    ["a record without names", { ...validRecord, names: undefined }],
    ["a record with null names", { ...validRecord, names: null }],
    [
      "a record without an English name",
      { ...validRecord, names: { ru: "Москва" } },
    ],
    [
      "a record with a numeric Russian name",
      { ...validRecord, names: { en: "Moscow", ru: 1 } },
    ],
    [
      "a record without a country code",
      { ...validRecord, countryCode: undefined },
    ],
  ])("should reject %s", (_label, record) => {
    expect(() =>
      parseCitySearchData({ zoneCities: [record], cityData: validCityData }),
    ).toThrow(INVALID_RECORDS_MESSAGE);
  });
});
