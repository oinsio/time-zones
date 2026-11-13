// Verifies FR12, M1, M4 of add-geonames-city-source: every row of "A broken file fails".
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { checkCityData } from "../../../scripts/cityData/checkCityData.ts";
import type { CityDataset } from "../../../scripts/cityData/cityDataTypes.ts";
import { readReleaseZoneIds } from "../../../scripts/cityData/readReleaseZoneIds.ts";
import { loadZoneData } from "../../../scripts/zoneData/loadZoneData.ts";
import {
  buildCity,
  buildDataset,
  RELEASE_ZONES,
} from "./checkCityData.fixtures.ts";

const check = (dataset: unknown) => checkCityData(dataset, RELEASE_ZONES, []);

describe("checkCityData", () => {
  it("should pass the committed file", () => {
    const dataset = JSON.parse(
      readFileSync("city-data/geonames-cities.json", "utf8"),
    );
    const releaseZones = readReleaseZoneIds(
      readFileSync("zone-rules/release.json", "utf8"),
    );
    expect(
      checkCityData(dataset, releaseZones, loadZoneData().zoneCities),
    ).toEqual([]);
  });

  it("should pass a valid dataset", () => {
    expect(check(buildDataset())).toEqual([]);
  });

  it("should name the city and the zone when the zone is not in the release", () => {
    const dataset = buildDataset();
    dataset.zones = ["Mars/Olympus"];
    const errors = check(dataset);
    expect(errors[0]).toContain("Town1 (1)");
    expect(errors[0]).toContain("Mars/Olympus");
  });

  it("should name the ID that appears twice", () => {
    const errors = check(
      buildDataset([buildCity(5, { english: "Other", russian: "Другой" })]),
    );
    expect(errors).toEqual(["The GeoNames ID 5 appears twice"]);
  });

  it("should name the GeoNames ID of a city with an empty English name", () => {
    const errors = check(buildDataset([buildCity(9000, { english: "" })]));
    expect(errors).toEqual(["The city 9000 has an empty English name"]);
  });

  it("should name a namesake without a region", () => {
    const errors = check(
      buildDataset([buildCity(9000, { english: "Town1", russian: "Другой" })]),
    );
    expect(
      errors.some((error) =>
        error.includes("Town1 (9000) is a namesake without a region"),
      ),
    ).toBe(true);
  });

  it("should name a region without a namesake", () => {
    const dataset = buildDataset();
    dataset.cities[0] = [1, "Town1", "Город1", "DE", 0, 100_001, 0];
    expect(check(dataset)).toEqual([
      "The city Town1 (1) has a region but is not a namesake",
    ]);
  });

  it("should name the count and the minimum for 5 999 cities", () => {
    const dataset = buildDataset();
    dataset.cities.pop();
    expect(check(dataset)).toEqual([
      "The city data holds 5999 cities; the minimum is 6000",
    ]);
  });

  it("should name the share and the minimum for 94% Cyrillic names", () => {
    const dataset = buildDataset();
    for (let index = 0; index < 360; index += 1)
      dataset.cities[index] = buildCity(index + 1, { russian: 0 });
    expect(check(dataset)).toEqual([
      "94% of the Russian names are in Cyrillic; the minimum is 95%",
    ]);
  });

  it("should fail a zone city namesake that has no region entry", () => {
    const zoneCity = {
      timeZoneId: "Europe/Berlin",
      names: { en: "Town1", ru: "Город1" },
      countryCode: "DE",
    };
    const errors = checkCityData(buildDataset(), RELEASE_ZONES, [zoneCity]);
    expect(errors).toContain(
      "The zone city Europe/Berlin is a namesake without a region",
    );
  });

  it("should accept a zone city namesake with a region entry", () => {
    const dataset: CityDataset = buildDataset();
    dataset.cities[0] = [1, "Town1", "Город1", "DE", 0, 100_001, 0];
    dataset.zoneCityRegions = { "Europe/Berlin": 0 };
    const zoneCity = {
      timeZoneId: "Europe/Berlin",
      names: { en: "Town1", ru: "Город1" },
      countryCode: "DE",
    };
    expect(checkCityData(dataset, RELEASE_ZONES, [zoneCity])).toEqual([]);
  });

  it("should reject a zone city region of a zone city that is not a namesake", () => {
    const dataset = buildDataset();
    dataset.zoneCityRegions = { "Europe/Berlin": 0 };
    expect(check(dataset)).toEqual([
      "The zone city Europe/Berlin has a region but is not a namesake",
    ]);
  });

  it.each([
    ["a non-object", 5],
    ["a wrong format version", { formatVersion: 2 }],
    [
      "a missing section",
      { formatVersion: 1, source: { name: "a", licence: "b", dumpDate: "c" } },
    ],
  ])("should fail for %s", (_, value) => {
    expect(check(value)).toHaveLength(1);
  });

  it.each([
    ["a bad tuple", [1, "A"]],
    ["a bad country code", [1, "A", "А", "de", 0, 5]],
    ["a bad population", [1, "A", "А", "DE", 0, -5]],
    ["an unknown zone index", [1, "A", "А", "DE", 9, 5]],
    ["an unknown region index", [1, "A", "А", "DE", 0, 5, 9]],
  ])("should fail for %s", (_, tuple) => {
    const dataset = buildDataset();
    dataset.cities.push(tuple as never);
    expect(check(dataset).length).toBeGreaterThan(0);
  });
});
