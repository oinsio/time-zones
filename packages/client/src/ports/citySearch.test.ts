// Verifies FR1 of show-city-labels-in-interface-language (D2).
import { describe, expect, it } from "vitest";
import { type CityRecord, isCityNameOfRecord } from "./citySearch";

const tokyoRecord: CityRecord = {
  id: "Asia/Tokyo",
  timeZoneId: "Asia/Tokyo",
  names: { en: "Tokyo", ru: "Токио" },
  countryCode: "JP",
  aliases: [],
  rank: 1,
};

describe("isCityNameOfRecord", () => {
  it.each([
    { label: "Tokyo", expected: true },
    { label: "Токио", expected: true },
    { label: "Edo", expected: false },
    { label: "", expected: false },
  ])(
    "should return $expected for the label «$label»",
    ({ label, expected }) => {
      expect(isCityNameOfRecord(tokyoRecord, label)).toBe(expected);
    },
  );
});
