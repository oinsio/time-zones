// Verifies FR4 of add-locations-via-search (D7).
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
  zone("Europe/Istanbul", "Istanbul"),
];
const zoneIds = zoneCities.map((city) => city.timeZoneId);
const source = createAbbreviationSource(
  createZoneCitiesSource(zoneCities, () => zoneIds).records,
);
const match = (query: string) =>
  source
    .match(query)
    .map((result) => [result.record.timeZoneId, result.matchedAbbreviation]);

describe("abbreviation source", () => {
  it("should return every zone of an ambiguous abbreviation in table order", () => {
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

  it("should match case-insensitively", () => {
    expect(match("est")).toEqual([["America/New_York", "EST"]]);
  });

  it("should not match a partial abbreviation", () => {
    expect(match("is")).toEqual([]);
  });

  it("should not match a longer query", () => {
    expect(match("istx")).toEqual([]);
  });

  it("should skip mapped zones that have no record", () => {
    expect(match("cst")).toEqual([]);
  });

  it("should not treat inherited object keys as abbreviations", () => {
    expect(match("constructor")).toEqual([]);
  });
});
