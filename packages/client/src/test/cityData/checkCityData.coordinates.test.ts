// Verifies FR12, M1 of add-geonames-city-source: the format and tuple rows of "A broken file fails" name their offender.
// Verifies FR1, FR4 of add-city-coordinates-to-locations (D2, D4).
import { describe, expect, it } from "vitest";
import { checkCityData } from "../../../scripts/cityData/checkCityData.ts";
import type { CityTuple } from "../../../scripts/cityData/cityDataTypes.ts";
import {
  buildCity,
  buildDataset,
  RELEASE_ZONES,
} from "./checkCityData.fixtures.ts";

const FRESH_ID = 90_000;
const check = (dataset: unknown) => checkCityData(dataset, RELEASE_ZONES, []);

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

describe("checkCityData coordinates", () => {
  // @add-city-coordinates-to-locations @FR4
  const base = [FRESH_ID, "Alpha", "Альфа", "DE", 0, 5];
  const checkTuple = (tuple: unknown[]) => {
    const dataset = buildDataset();
    dataset.cities.push(tuple as CityTuple);
    return check(dataset);
  };

  it.each([
    [
      "a missing latitude and longitude",
      base,
      `The city Alpha (${FRESH_ID}) has no coordinates`,
    ],
    [
      "a text latitude",
      [...base, "55", 491],
      `The city Alpha (${FRESH_ID}) has the latitude 55`,
    ],
    [
      "a fractional latitude",
      [...base, 55.5, 491],
      `The city Alpha (${FRESH_ID}) has the latitude 55.5`,
    ],
    [
      "latitude 901 tenths",
      [...base, 901, 0],
      `The city Alpha (${FRESH_ID}) has the latitude 901`,
    ],
    [
      "latitude -901 tenths",
      [...base, -901, 0],
      `The city Alpha (${FRESH_ID}) has the latitude -901`,
    ],
    [
      "longitude 1801 tenths",
      [...base, 0, 1801],
      `The city Alpha (${FRESH_ID}) has the longitude 1801`,
    ],
    [
      "longitude -1801 tenths",
      [...base, 0, -1801],
      `The city Alpha (${FRESH_ID}) has the longitude -1801`,
    ],
  ])("should name the city for %s", (_, tuple, message) => {
    expect(checkTuple(tuple)).toEqual([message]);
  });

  it.each([
    [900, 1800],
    [-900, -1800],
    [0, 0],
  ])("should accept the tenths %s and %s", (latitude, longitude) => {
    expect(checkTuple([...base, latitude, longitude])).toEqual([]);
  });

  it("should name the format version 1 of the previous build", () => {
    expect(check({ ...buildDataset(), formatVersion: 1 })).toEqual([
      "The city data has the format version 1, expected 2",
    ]);
  });
});
