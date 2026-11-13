// Verifies FR3, NFR-P2 of add-geonames-city-source (D6): the shared matcher and its country text cache.
import { describe, expect, it } from "vitest";
import { CITY_NAME_LANGUAGES } from "@/constants";
import { type CityRecord, SearchMatchKind } from "@/ports";
import { startWorkCount } from "@/test/workCounters";
import {
  createCountryTextCache,
  createRecordMatcher,
} from "./cityTextMatching";

function record(
  id: string,
  english: string,
  russian: string,
  countryCode: string,
): CityRecord {
  return {
    id,
    timeZoneId: "Europe/Moscow",
    names: { en: english, ru: russian },
    countryCode,
    aliases: [],
    rank: 0,
    population: 0,
  };
}

describe("country text cache", () => {
  it("should build one formatter per city-name language for records of two countries", () => {
    const workCount = startWorkCount();
    try {
      const readCountryTexts = createCountryTextCache();
      for (const countryCode of ["RU", "KZ", "RU"])
        readCountryTexts(countryCode);
      expect(workCount.displayNames()).toBe(CITY_NAME_LANGUAGES.length);
    } finally {
      workCount.stop();
    }
  });

  it("should build no formatter before the first country is read", () => {
    const workCount = startWorkCount();
    try {
      createCountryTextCache();
      expect(workCount.displayNames()).toBe(0);
    } finally {
      workCount.stop();
    }
  });

  it("should return no texts for an empty country code", () => {
    expect(createCountryTextCache()("")).toEqual([]);
  });

  it("should return the country name in each language, normalized", () => {
    const texts = createCountryTextCache()("RU").map((text) => text.normalized);
    expect(texts).toEqual(["russia", "россия"]);
  });
});

describe("record matcher", () => {
  const records = [
    record("1", "Kazan", "Казань", "RU"),
    record("2", "New York", "Нью-Йорк", "US"),
  ];

  it.each([
    ["kaz", "1", SearchMatchKind.CITY_PREFIX],
    ["york", "2", SearchMatchKind.CITY_WORD_PREFIX],
    ["russ", "1", SearchMatchKind.COUNTRY],
    ["казан", "1", SearchMatchKind.CITY_PREFIX],
  ])("should match %j", (query, id, matchKind) => {
    const results = createRecordMatcher(
      records,
      createCountryTextCache(),
    )(query);
    expect(
      results.map((result) => [result.record.id, result.matchKind]),
    ).toEqual([[id, matchKind]]);
  });

  it("should build no searchable text before the first match", () => {
    const workCount = startWorkCount();
    try {
      createRecordMatcher(records, createCountryTextCache());
      expect(workCount.normalizations()).toBe(0);
    } finally {
      workCount.stop();
    }
  });
});
