// Verifies FR4, FR7, FR8 of add-geonames-city-source (D7, D9): the result ID, the region and "added".
import i18n from "i18next";
import { describe, expect, it } from "vitest";
import {
  type CityRecord,
  type CitySearchResult,
  SearchMatchKind,
} from "@/ports";
import { buildLocation } from "@/test/factories/buildLocation";
import { presentSearchResults } from "./presentSearchResults";

const IN_EN = {
  language: "en",
  cityNameLanguage: "en",
  translate: i18n.getFixedT("en"),
} as const;
const IN_RU = {
  language: "ru",
  cityNameLanguage: "ru",
  translate: i18n.getFixedT("ru"),
} as const;

const springfield = (
  id: string,
  region?: { en: string; ru: string },
): CityRecord => ({
  id,
  timeZoneId: "America/Chicago",
  names: { en: "Springfield", ru: "Спрингфилд" },
  countryCode: "US",
  aliases: [],
  rank: 0,
  population: 100_000,
  region,
});
const ILLINOIS = springfield("4250542", { en: "Illinois", ru: "Иллинойс" });
const MISSOURI = springfield("4409896", { en: "Missouri", ru: "Миссури" });
const MASSACHUSETTS = {
  ...springfield("4951788", { en: "Massachusetts", ru: "Массачусетс" }),
  timeZoneId: "America/New_York",
};
const kazan: CityRecord = {
  id: "551487",
  timeZoneId: "Europe/Moscow",
  names: { en: "Kazan", ru: "Казань" },
  countryCode: "RU",
  aliases: [],
  rank: 0,
  population: 1_243_500,
};
const moscow: CityRecord = {
  ...kazan,
  id: "Europe/Moscow",
  names: { en: "Moscow", ru: "Москва" },
};

const resultFor = (record: CityRecord): CitySearchResult => ({
  record,
  matchKind: SearchMatchKind.CITY_PREFIX,
});

describe("present search results with regions", () => {
  it("should carry the record ID", () => {
    const [presented] = presentSearchResults([resultFor(ILLINOIS)], [], IN_EN);
    expect(presented?.id).toBe("4250542");
  });

  it.each([
    ["English", IN_EN, "Illinois"],
    ["Russian", IN_RU, "Иллинойс"],
  ])(
    "should give a namesake its region in %s",
    (_label, context, regionName) => {
      const [presented] = presentSearchResults(
        [resultFor(ILLINOIS)],
        [],
        context,
      );
      expect(presented?.regionName).toBe(regionName);
    },
  );

  it("should give a record without a region none", () => {
    const [presented] = presentSearchResults([resultFor(kazan)], [], IN_EN);
    expect(presented?.regionName).toBeUndefined();
  });

  it("should mark Springfield Illinois as added when Springfield Missouri is in the list, leaving Massachusetts addable", () => {
    const locations = [
      buildLocation({ timeZoneId: "America/Chicago", label: "Springfield" }),
    ];
    const presented = presentSearchResults(
      [resultFor(ILLINOIS), resultFor(MISSOURI), resultFor(MASSACHUSETTS)],
      locations,
      IN_EN,
    );
    expect(presented.map((result) => result.isAdded)).toEqual([
      true,
      true,
      false,
    ]);
  });

  it("should not mark Kazan as added when Moscow is in the list", () => {
    const locations = [
      buildLocation({ timeZoneId: "Europe/Moscow", label: "Moscow" }),
    ];
    const presented = presentSearchResults(
      [resultFor(moscow), resultFor(kazan)],
      locations,
      IN_EN,
    );
    expect(presented.map((result) => result.isAdded)).toEqual([true, false]);
  });
});
