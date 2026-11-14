// Verifies FR12, M1 of add-geonames-city-source: the format and tuple rows of "A broken file fails" name their offender.
import { describe, expect, it } from "vitest";
import { checkCityData } from "../../../scripts/cityData/checkCityData.ts";
import type { CityTuple } from "../../../scripts/cityData/cityDataTypes.ts";
import {
  buildCity,
  buildDataset,
  RELEASE_ZONES,
} from "./checkCityData.fixtures.ts";

const FORMAT_ERROR = "The city data does not have the format of design D5";
const FRESH_ID = 90_000;
const check = (dataset: unknown) => checkCityData(dataset, RELEASE_ZONES, []);

describe("checkCityData format", () => {
  it.each([
    ["null", null],
    ["an array", []],
    ["a string", "text"],
  ])("should say that %s is not an object", (_, value) => {
    expect(check(value)).toEqual(["The city data is not an object"]);
  });

  it("should name the wrong format version", () => {
    expect(check({ formatVersion: 2 })).toEqual([
      "The city data has the format version 2, expected 1",
    ]);
  });

  it.each([
    ["a source that is null", { source: null }],
    ["a source that is an array", { source: [] }],
    [
      "a source without a name",
      { source: { name: " ", licence: "b", dumpDate: "c" } },
    ],
    [
      "a source without a licence",
      { source: { name: "a", licence: "", dumpDate: "c" } },
    ],
    [
      "a source without a dump date",
      { source: { name: "a", licence: "b", dumpDate: 5 } },
    ],
    ["zones that are not an array", { zones: "Europe/Berlin" }],
    ["an empty zone", { zones: [""] }],
    ["a blank zone beside a valid one", { zones: ["Europe/Berlin", " "] }],
    ["regions that are not an array", { regions: {} }],
    ["a region that is not an array", { regions: ["Illinois"] }],
    ["a region without an English name", { regions: [["", "Иллинойс"]] }],
    ["a region without a Russian name", { regions: [["Illinois", ""]] }],
    ["cities that are not an array", { cities: {} }],
    ["zone city populations that are an array", { zoneCityPopulations: [] }],
    ["zone city populations that are null", { zoneCityPopulations: null }],
    ["zone city regions that are an array", { zoneCityRegions: [] }],
    ["zone city regions that are null", { zoneCityRegions: null }],
  ])("should name the format of design D5 for %s", (_, broken) => {
    expect(check({ ...buildDataset(), ...broken })).toEqual([FORMAT_ERROR]);
  });
});

describe("checkCityData city tuples", () => {
  const withTuple = (tuple: unknown) => {
    const dataset = buildDataset();
    const position = dataset.cities.length;
    dataset.cities.push(tuple as CityTuple);
    return { dataset, position };
  };
  const base = [FRESH_ID, "Alpha", "Альфа", "DE", 0, 5];

  it("should name the position of a tuple of the wrong length", () => {
    const { dataset, position } = withTuple([FRESH_ID, "Alpha"]);
    expect(check(dataset)).toEqual([
      `The city at position ${position} is not a city tuple`,
    ]);
  });

  it("should name the position of a tuple that is not an array", () => {
    const { dataset, position } = withTuple("Alpha");
    expect(check(dataset)).toEqual([
      `The city at position ${position} is not a city tuple`,
    ]);
  });

  it("should accept a tuple with a region", () => {
    const { dataset } = withTuple([...base, 0]);
    expect(check(dataset)).toEqual([
      `The city Alpha (${FRESH_ID}) has a region but is not a namesake`,
    ]);
  });

  it.each([
    [
      "a fractional ID",
      [1.5, "Alpha", "Альфа", "DE", 0, 5],
      "The city at position 6000 has no GeoNames ID",
    ],
    [
      "a negative ID",
      [-1, "Alpha", "Альфа", "DE", 0, 5],
      "The city at position 6000 has no GeoNames ID",
    ],
    [
      "an empty Russian name",
      [FRESH_ID, "Alpha", "", "DE", 0, 5],
      `The city Alpha (${FRESH_ID}) has an empty Russian name`,
    ],
    [
      "a blank English name",
      [FRESH_ID, " ", "Альфа", "DE", 0, 5],
      `The city ${FRESH_ID} has an empty English name`,
    ],
    [
      "a lower-case country code",
      [FRESH_ID, "Alpha", "Альфа", "de", 0, 5],
      `The city Alpha (${FRESH_ID}) has the country code de`,
    ],
    [
      "a negative population",
      [FRESH_ID, "Alpha", "Альфа", "DE", 0, -5],
      `The city Alpha (${FRESH_ID}) has the population -5`,
    ],
    [
      "a fractional population",
      [FRESH_ID, "Alpha", "Альфа", "DE", 0, 1.5],
      `The city Alpha (${FRESH_ID}) has the population 1.5`,
    ],
    [
      "an unknown zone index",
      [FRESH_ID, "Alpha", "Альфа", "DE", 9, 5],
      `The city Alpha (${FRESH_ID}) has the unknown zone index 9`,
    ],
    [
      "an unknown region index",
      [FRESH_ID, "Alpha", "Альфа", "DE", 0, 5, 9],
      `The city Alpha (${FRESH_ID}) has the unknown region index 9`,
    ],
  ])("should name the offender for %s", (_, tuple, message) => {
    const { dataset } = withTuple(tuple);
    expect(check(dataset)).toEqual([message]);
  });

  it("should accept a population of 0 and the marker for no Russian name", () => {
    const { dataset } = withTuple([FRESH_ID, "Alpha", 0, "DE", 0, 0]);
    expect(check(dataset)).toEqual([]);
  });
});

describe("checkCityData thresholds and zone cities", () => {
  it("should accept exactly 95% Cyrillic Russian names", () => {
    const dataset = buildDataset();
    for (let index = 0; index < 300; index += 1)
      dataset.cities[index] = buildCity(index + 1, { russian: 0 });
    expect(check(dataset)).toEqual([]);
  });

  it("should count a Latin Russian name as not Cyrillic", () => {
    const dataset = buildDataset();
    for (let index = 0; index < 360; index += 1)
      dataset.cities[index] = buildCity(index + 1, {
        russian: `Latin${index}`,
      });
    expect(check(dataset)).toEqual([
      "94% of the Russian names are in Cyrillic; the minimum is 95%",
    ]);
  });

  it("should report 0% Cyrillic for no cities", () => {
    const dataset = { ...buildDataset(), cities: [] };
    expect(check(dataset)).toEqual([
      "The city data holds 0 cities; the minimum is 6000",
      "0% of the Russian names are in Cyrillic; the minimum is 95%",
    ]);
  });

  it("should ignore zone cities without a country code", () => {
    const zoneCity = {
      timeZoneId: "Etc/GMT",
      names: { en: "Same", ru: "Тот же" },
      countryCode: "",
    };
    const other = { ...zoneCity, timeZoneId: "Etc/UTC" };
    expect(
      checkCityData(buildDataset(), RELEASE_ZONES, [zoneCity, other]),
    ).toEqual([]);
  });
});
