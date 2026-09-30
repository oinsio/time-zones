// Verifies FR2, FR3 of add-locations-via-search (D7).
import { describe, expect, it } from "vitest";
import { SearchMatchKind } from "@/ports";

import { almaty, idsOf, moscow, newYork, utc } from "./zoneCitiesFixtures";
import { createZoneCitiesSource } from "./zoneCitiesSource";

describe("zone cities source matching", () => {
  const source = createZoneCitiesSource([moscow, newYork, almaty, utc], () => [
    "Europe/Moscow",
    "America/New_York",
    "Asia/Almaty",
  ]);
  const match = (query: string) =>
    source
      .match(query)
      .map((result) => [result.record.timeZoneId, result.matchKind]);

  it("should match a city prefix in English", () => {
    expect(match("mos")).toEqual([
      ["Europe/Moscow", SearchMatchKind.CITY_PREFIX],
    ]);
  });

  it("should match a city prefix in Russian", () => {
    expect(match("моск")).toEqual([
      ["Europe/Moscow", SearchMatchKind.CITY_PREFIX],
    ]);
  });

  it("should match a later word of the city name", () => {
    expect(match("york")).toEqual([
      ["America/New_York", SearchMatchKind.CITY_WORD_PREFIX],
    ]);
  });

  it("should match a whole multi-word name as a prefix", () => {
    expect(match("new y")).toEqual([
      ["America/New_York", SearchMatchKind.CITY_PREFIX],
    ]);
  });

  it("should match a country in English", () => {
    expect(match("kazakh")).toEqual([["Asia/Almaty", SearchMatchKind.COUNTRY]]);
  });

  it("should match a country in Russian", () => {
    expect(match("казах")).toEqual([["Asia/Almaty", SearchMatchKind.COUNTRY]]);
  });

  it("should match a later word of a country name", () => {
    expect(match("states")).toEqual([
      ["America/New_York", SearchMatchKind.COUNTRY],
    ]);
  });

  it("should report the city kind when a zone matches by city and by country", () => {
    const russiaSource = createZoneCitiesSource(
      [{ ...moscow, names: { en: "Russia Town", ru: "Россия-таун" } }],
      () => ["Europe/Moscow"],
    );
    expect(russiaSource.match("russia").map((r) => r.matchKind)).toEqual([
      SearchMatchKind.CITY_PREFIX,
    ]);
  });

  it("should report a city word match before a country match", () => {
    const wordSource = createZoneCitiesSource(
      [{ ...moscow, names: { en: "Big Russia", ru: "Большая" } }],
      () => ["Europe/Moscow"],
    );
    expect(wordSource.match("russia").map((r) => r.matchKind)).toEqual([
      SearchMatchKind.CITY_WORD_PREFIX,
    ]);
  });

  it("should match nothing for an unrelated query", () => {
    expect(match("qqqq")).toEqual([]);
  });

  it("should not match a zone without a country by country", () => {
    expect(match("utc").map(([id]) => id)).toEqual(["UTC"]);
  });

  it("should not report a match for the empty country name of UTC", () => {
    expect(source.match("x")).toEqual([]);
  });
});

describe("zone cities source edge cases", () => {
  it("should drop listed identifiers that are not valid zones", () => {
    const source = createZoneCitiesSource([moscow], () => [
      "Europe/Moscow",
      "Mars/Olympus_Mons",
      "+05:00",
    ]);
    expect(idsOf(source)).toEqual(["Europe/Moscow", "UTC"]);
  });

  it("should use every data zone when the browser has no supportedValuesOf", () => {
    const original = Object.getOwnPropertyDescriptor(
      Intl,
      "supportedValuesOf",
    ) as PropertyDescriptor;
    Object.defineProperty(Intl, "supportedValuesOf", {
      ...original,
      value: undefined,
    });
    try {
      expect(idsOf(createZoneCitiesSource([moscow, almaty]))).toEqual([
        "Europe/Moscow",
        "Asia/Almaty",
        "UTC",
      ]);
    } finally {
      Object.defineProperty(Intl, "supportedValuesOf", original);
    }
  });

  it("should not match the end of a word", () => {
    const source = createZoneCitiesSource([newYork], () => [
      "America/New_York",
    ]);
    expect(source.match("ork")).toEqual([]);
  });

  it("should still match by city when the country code is unknown to Intl", () => {
    const source = createZoneCitiesSource(
      [{ ...moscow, countryCode: "QQ" }],
      () => ["Europe/Moscow"],
    );
    expect(source.match("mos")).toHaveLength(1);
    expect(source.match("russia")).toEqual([]);
  });
});
