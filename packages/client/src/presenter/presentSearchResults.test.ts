// Verifies FR5, FR8, UX3 of add-locations-via-search (D9).
// Verifies FR10, FR11, UX3 of show-zone-abbreviations-and-zone-label-setting (D8).
import i18n from "i18next";
import { describe, expect, it } from "vitest";
import {
  type CityRecord,
  type CitySearchResult,
  SearchMatchKind,
} from "@/ports";
import { buildLocation } from "@/test/factories/buildLocation";
import { presentSearchResults } from "./presentSearchResults";

const moscowRecord: CityRecord = {
  id: "Europe/Moscow",
  timeZoneId: "Europe/Moscow",
  names: { en: "Moscow", ru: "Москва" },
  countryCode: "RU",
  aliases: ["MSK"],
  rank: 7,
  population: 0,
};
const resultFor = (
  record: CityRecord,
  matchedAbbreviation?: string,
): CitySearchResult => ({
  record,
  matchKind: SearchMatchKind.CITY_PREFIX,
  matchedAbbreviation,
});

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
const zoneRecord = (timeZoneId: string): CityRecord => ({
  ...moscowRecord,
  id: timeZoneId,
  timeZoneId,
});

describe("present search results", () => {
  it("should show the city and country in the interface language", () => {
    const [presented] = presentSearchResults(
      [resultFor(moscowRecord)],
      [],
      IN_RU,
    );
    expect(presented).toMatchObject({
      timeZoneId: "Europe/Moscow",
      cityName: "Москва",
      countryCode: "RU",
      countryName: "Россия",
    });
  });

  it("should show English names for the English interface", () => {
    const [presented] = presentSearchResults(
      [resultFor(moscowRecord)],
      [],
      IN_EN,
    );
    expect(presented).toMatchObject({
      cityName: "Moscow",
      countryName: "Russia",
    });
  });

  it.each([
    [
      "America/New_York",
      "EDT",
      [
        { text: "EST", isMatched: false },
        { text: "EDT", isMatched: true },
      ],
    ],
    [
      "America/New_York",
      "EST",
      [
        { text: "EST", isMatched: true },
        { text: "EDT", isMatched: false },
      ],
    ],
    ["America/Panama", "EST", [{ text: "EST", isMatched: true }]],
    [
      "Europe/Dublin",
      "IST",
      [
        { text: "GMT", isMatched: false },
        { text: "IST", isMatched: true },
      ],
    ],
  ])(
    "should present the pair of %s for %s with the matched one marked",
    (timeZoneId, matched, expected) => {
      const [presented] = presentSearchResults(
        [resultFor(zoneRecord(timeZoneId), matched)],
        [],
        IN_EN,
      );
      expect(presented?.abbreviationPair).toEqual(expected);
    },
  );

  it("should write МСК in the Russian pair", () => {
    const [presented] = presentSearchResults(
      [resultFor(moscowRecord, "MSK")],
      [],
      IN_RU,
    );
    expect(presented?.abbreviationPair).toEqual([
      { text: "МСК", isMatched: true },
    ]);
  });

  it("should give no pair for a result that is no abbreviation match", () => {
    const [presented] = presentSearchResults(
      [resultFor(moscowRecord)],
      [],
      IN_EN,
    );
    expect(presented?.abbreviationPair).toBeUndefined();
  });

  it("should give an empty country name for a zone without a country", () => {
    const utcRecord = {
      ...moscowRecord,
      timeZoneId: "UTC",
      names: { en: "UTC", ru: "UTC" },
      countryCode: "",
    };
    expect(
      presentSearchResults([resultFor(utcRecord)], [], IN_EN)[0]?.countryName,
    ).toBe("");
  });

  it.each([
    ["the English label", "Moscow", "Europe/Moscow", true],
    ["the Russian label", "Москва", "Europe/Moscow", true],
    ["another label", "Moskva", "Europe/Moscow", false],
    ["another zone", "Moscow", "Europe/Kyiv", false],
  ])(
    "should mark added when the list has %s",
    (_name, label, timeZoneId, expected) => {
      const locations = [buildLocation({ label, timeZoneId })];
      const [presented] = presentSearchResults(
        [resultFor(moscowRecord)],
        locations,
        IN_EN,
      );
      expect(presented?.isAdded).toBe(expected);
    },
  );

  it("should not mark a result added when the list is empty", () => {
    expect(
      presentSearchResults([resultFor(moscowRecord)], [], IN_EN)[0]?.isAdded,
    ).toBe(false);
  });
});
