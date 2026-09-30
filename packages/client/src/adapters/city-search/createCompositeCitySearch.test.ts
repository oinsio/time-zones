// Verifies FR1–FR7 of add-locations-via-search (D7).
import { describe, expect, it } from "vitest";
import { MAX_SEARCH_RESULTS, POPULAR_TIME_ZONE_IDS } from "@/constants";
import { SearchMatchKind } from "@/ports";
import type { ZoneCityData } from "./citySource";
import { createCompositeCitySearch } from "./createCompositeCitySearch";

const city = (
  timeZoneId: string,
  en: string,
  ru: string,
  countryCode = "",
): ZoneCityData => ({ timeZoneId, names: { en, ru }, countryCode });

const zoneCities: ZoneCityData[] = [
  city("Asia/Kolkata", "Kolkata", "Калькутта", "IN"),
  city("Asia/Jerusalem", "Jerusalem", "Иерусалим", "IL"),
  city("Europe/Dublin", "Dublin", "Дублин", "IE"),
  city("Europe/Istanbul", "Istanbul", "Стамбул", "TR"),
  city("Europe/Moscow", "Moscow", "Москва", "RU"),
  city("Europe/Tallinn", "Tallinn", "Таллин", "EE"),
  city("America/New_York", "New York", "Нью-Йорк", "US"),
  city("America/Sao_Paulo", "São Paulo", "Сан-Паулу", "BR"),
  city("Asia/Almaty", "Almaty", "Алматы", "KZ"),
  city("Asia/Qostanay", "Kostanay", "Костанай", "KZ"),
  city("Asia/Aqtobe", "Aqtobe", "Актобе", "KZ"),
  city("UTC", "UTC", "UTC"),
];
const search = createCompositeCitySearch(zoneCities);
const idsOf = (query: string, language: "en" | "ru" = "en") =>
  search.search(query, language).map((result) => result.record.timeZoneId);

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

describe("composite city search result set", () => {
  it("should list each zone once, at its best match kind", () => {
    const ids = idsOf("ist");
    expect(new Set(ids).size).toBe(ids.length);
    const utcResults = search.search("utc", "en");
    expect(utcResults).toHaveLength(1);
    expect(utcResults[0]?.matchKind).toBe(SearchMatchKind.ABBREVIATION);
  });

  it("should cap a single-letter query over many zones at the limit", () => {
    const realZones = Intl.supportedValuesOf("timeZone").map((timeZoneId) =>
      city(timeZoneId, `Aaa ${timeZoneId}`, "Город"),
    );
    const bigSearch = createCompositeCitySearch(realZones);
    expect(bigSearch.search("a", "en")).toHaveLength(MAX_SEARCH_RESULTS);
  });
});

describe("composite city search suggestions", () => {
  it("should suggest the popular zones in popular order", () => {
    expect(search.suggest().map((result) => result.record.timeZoneId)).toEqual(
      POPULAR_TIME_ZONE_IDS,
    );
  });

  it("should mark suggestions as suggestions", () => {
    expect(search.suggest().map((result) => result.matchKind)).toEqual(
      search.suggest().map(() => SearchMatchKind.SUGGESTION),
    );
  });
});
