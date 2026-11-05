// Verifies FR8, FR9, FR11 of show-zone-abbreviations-and-zone-label-setting (D8).
import { describe, expect, it } from "vitest";
import { SearchMatchKind } from "@/ports";
import { createAbbreviationSource } from "./abbreviationSource";
import type { ZoneCityData } from "./citySource";
import { createZoneCitiesSource } from "./zoneCitiesSource";

const zone = (timeZoneId: string, en: string): ZoneCityData => ({
  timeZoneId,
  names: { en, ru: en },
  countryCode: "",
});
const zoneCities = [
  zone("Asia/Kolkata", "Kolkata"),
  zone("Asia/Jerusalem", "Jerusalem"),
  zone("Europe/Dublin", "Dublin"),
  zone("America/New_York", "New York"),
  zone("America/Panama", "Panama"),
  zone("Pacific/Guam", "Guam"),
  zone("Europe/London", "London"),
  zone("Asia/Dhaka", "Dhaka"),
  zone("Asia/Almaty", "Almaty"),
  zone("America/Sao_Paulo", "São Paulo"),
  zone("Europe/Istanbul", "Istanbul"),
  zone("UTC", "UTC"),
];
const zoneIds = zoneCities.map((city) => city.timeZoneId);
const source = createAbbreviationSource(
  createZoneCitiesSource(zoneCities, () => zoneIds).records,
);
const match = (query: string) =>
  source
    .match(query)
    .map((result) => [result.record.timeZoneId, result.matchedAbbreviation]);
const zoneIdsOf = (query: string) => match(query).map(([zoneId]) => zoneId);

describe("abbreviation source", () => {
  it("should return every zone whose pair holds an ambiguous abbreviation", () => {
    expect(match("ist")).toEqual([
      ["Asia/Kolkata", "IST"],
      ["Asia/Jerusalem", "IST"],
      ["Europe/Dublin", "IST"],
    ]);
  });

  it("should mark every result as an abbreviation match", () => {
    expect(source.match("ist").map((result) => result.matchKind)).toEqual([
      SearchMatchKind.ABBREVIATION,
      SearchMatchKind.ABBREVIATION,
      SearchMatchKind.ABBREVIATION,
    ]);
  });

  it.each(["est", "EDT", "edt"])("should find New York by %s", (query) => {
    expect(zoneIdsOf(query)[0]).toBe("America/New_York");
  });

  it("should find Panama by EST as well as New York", () => {
    expect(zoneIdsOf("EST")).toEqual(["America/New_York", "America/Panama"]);
  });

  it("should report the tzdb spelling of a mixed-case abbreviation", () => {
    expect(match("chst")).toEqual([["Pacific/Guam", "ChST"]]);
  });

  it("should find London by GMT and BST and not the UTC zone or Dhaka", () => {
    expect(zoneIdsOf("gmt")).toContain("Europe/London");
    expect(zoneIdsOf("gmt")).not.toContain("UTC");
    expect(zoneIdsOf("bst")).toEqual(["Europe/London"]);
  });

  it("should find the UTC zone by UTC", () => {
    expect(match("utc")).toEqual([["UTC", "UTC"]]);
  });

  it.each(["ET", "PT", "ALMT", "ICT", "SGT", "GST", "BRT", "ART"])(
    "should no longer find anything by %s",
    (query) => {
      expect(match(query)).toEqual([]);
    },
  );

  it("should not match a partial abbreviation", () => {
    expect(match("is")).toEqual([]);
  });

  it("should not match a longer query", () => {
    expect(match("istx")).toEqual([]);
  });

  it("should not treat inherited object keys as abbreviations", () => {
    expect(match("constructor")).toEqual([]);
  });
});
