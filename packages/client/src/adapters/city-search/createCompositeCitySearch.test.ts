// Verifies FR1–FR7 of add-locations-via-search (D7).
import { describe, expect, it } from "vitest";
import { SearchMatchKind } from "@/ports";
import { city, idsOf, search } from "./compositeCityFixtures";
import { createCompositeCitySearch } from "./createCompositeCitySearch";

describe("composite city search ordering", () => {
  it("should put abbreviation matches first in table order, then city prefixes", () => {
    expect(idsOf("IST")).toEqual([
      "Asia/Kolkata",
      "Asia/Jerusalem",
      "Europe/Dublin",
      "Europe/Istanbul",
    ]);
  });

  it("should report the matched abbreviation only for abbreviation results", () => {
    const abbreviations = search
      .search("IST", "en")
      .map((result) => result.matchedAbbreviation);
    expect(abbreviations).toEqual(["IST", "IST", "IST", undefined]);
  });

  it("should put a city match before country matches", () => {
    expect(idsOf("est")[0]).toBe("America/New_York");
    expect(idsOf("est")).toContain("Europe/Tallinn");
  });

  it("should rank a city prefix before a later-word match before a country match", () => {
    const orderedSearch = createCompositeCitySearch([
      city("Europe/Moscow", "Moscow", "Москва", "RU"),
      city("Asia/Almaty", "Almaty", "Алматы", "KZ"),
      city("America/New_York", "New York", "Нью-Йорк", "US"),
      city("Asia/Tokyo", "Tokyo York", "Токио", "JP"),
      city("Asia/Yerevan", "York Town", "Ереван", "AM"),
    ]);
    const kinds = orderedSearch
      .search("york", "en")
      .map((result) => result.matchKind);
    expect(kinds).toEqual([
      SearchMatchKind.CITY_PREFIX,
      SearchMatchKind.CITY_WORD_PREFIX,
      SearchMatchKind.CITY_WORD_PREFIX,
    ]);
  });

  it("should put popular locations first within one kind", () => {
    expect(idsOf("kazakh")[0]).toBe("Asia/Almaty");
  });

  it("should sort equally ranked matches by city name in the interface language", () => {
    expect(idsOf("kazakh", "en")).toEqual([
      "Asia/Almaty",
      "Asia/Aqtobe",
      "Asia/Qostanay",
    ]);
    expect(idsOf("kazakh", "ru")).toEqual([
      "Asia/Almaty",
      "Asia/Aqtobe",
      "Asia/Qostanay",
    ]);
  });

  it("should sort by the Russian names when the interface language is Russian", () => {
    const russianSearch = createCompositeCitySearch([
      city("Asia/Aqtobe", "Zzz", "Актобе", "KZ"),
      city("Asia/Qostanay", "Aaa", "Костанай", "KZ"),
    ]);
    expect(
      russianSearch.search("kazakh", "ru").map((r) => r.record.timeZoneId),
    ).toEqual(["Asia/Aqtobe", "Asia/Qostanay"]);
    expect(
      russianSearch.search("kazakh", "en").map((r) => r.record.timeZoneId),
    ).toEqual(["Asia/Qostanay", "Asia/Aqtobe"]);
  });
});

describe("composite city search matching", () => {
  it.each([
    ["sao paulo", "America/Sao_Paulo"],
    ["Москва", "Europe/Moscow"],
    ["  MOSCOW ", "Europe/Moscow"],
    ["york", "America/New_York"],
    ["alm", "Asia/Almaty"],
    ["Казахстан", "Asia/Almaty"],
  ])("should find %j", (query, expectedId) => {
    expect(idsOf(query)).toContain(expectedId);
  });

  it("should give Moscow as the first result for Moscow and Москва", () => {
    expect([idsOf("Moscow")[0], idsOf("Москва")[0]]).toEqual([
      "Europe/Moscow",
      "Europe/Moscow",
    ]);
  });

  it("should find only Kazakhstan zones for Kazakhstan", () => {
    const countryCodes = search
      .search("Kazakhstan", "en")
      .map((result) => result.record.countryCode);
    expect(new Set(countryCodes)).toEqual(new Set(["KZ"]));
  });

  it.each(["", "   "])(
    "should return nothing for the empty query %j",
    (query) => {
      expect(idsOf(query)).toEqual([]);
    },
  );

  it("should find nothing for an offset", () => {
    expect(idsOf("UTC+5")).toEqual([]);
  });

  it("should find nothing for unrelated text", () => {
    expect(idsOf("qqqq")).toEqual([]);
  });

  it("should not report an abbreviation for a partial abbreviation", () => {
    const abbreviations = search
      .search("IS", "en")
      .filter((result) => result.matchedAbbreviation !== undefined);
    expect(abbreviations).toEqual([]);
  });
});
