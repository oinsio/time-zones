// Verifies FR5, FR8, UX3 of add-locations-via-search (D9).
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
};
const resultFor = (
  record: CityRecord,
  matchedAbbreviation?: string,
): CitySearchResult => ({
  record,
  matchKind: SearchMatchKind.CITY_PREFIX,
  matchedAbbreviation,
});

describe("present search results", () => {
  it("should show the city and country in the interface language", () => {
    const [presented] = presentSearchResults(
      [resultFor(moscowRecord)],
      [],
      "ru",
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
      "en",
    );
    expect(presented).toMatchObject({
      cityName: "Moscow",
      countryName: "Russia",
    });
  });

  it("should pass the matched abbreviation through", () => {
    const [presented] = presentSearchResults(
      [resultFor(moscowRecord, "MSK")],
      [],
      "en",
    );
    expect(presented?.matchedAbbreviation).toBe("MSK");
  });

  it("should give an empty country name for a zone without a country", () => {
    const utcRecord = {
      ...moscowRecord,
      timeZoneId: "UTC",
      names: { en: "UTC", ru: "UTC" },
      countryCode: "",
    };
    expect(
      presentSearchResults([resultFor(utcRecord)], [], "en")[0]?.countryName,
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
        "en",
      );
      expect(presented?.isAdded).toBe(expected);
    },
  );

  it("should not mark a result added when the list is empty", () => {
    expect(
      presentSearchResults([resultFor(moscowRecord)], [], "en")[0]?.isAdded,
    ).toBe(false);
  });
});
