// Verifies FR2, FR3, FR9 of add-locations-via-search (D7).
import { describe, expect, it } from "vitest";
import { POPULAR_TIME_ZONE_IDS } from "@/constants";
import { SearchMatchKind } from "@/ports";
import type { ZoneCityData } from "./citySource";
import { createZoneCitiesSource } from "./zoneCitiesSource";

const moscow: ZoneCityData = {
  timeZoneId: "Europe/Moscow",
  names: { en: "Moscow", ru: "Москва" },
  countryCode: "RU",
};
const newYork: ZoneCityData = {
  timeZoneId: "America/New_York",
  names: { en: "New York", ru: "Нью-Йорк" },
  countryCode: "US",
};
const almaty: ZoneCityData = {
  timeZoneId: "Asia/Almaty",
  names: { en: "Almaty", ru: "Алматы" },
  countryCode: "KZ",
};
const utc: ZoneCityData = {
  timeZoneId: "UTC",
  names: { en: "UTC", ru: "UTC" },
  countryCode: "",
};

const idsOf = (source: ReturnType<typeof createZoneCitiesSource>) =>
  source.records.map((record) => record.timeZoneId);

describe("zone cities source records", () => {
  it("should build one record per listed zone joined with its names", () => {
    const source = createZoneCitiesSource([moscow, almaty], () => [
      "Europe/Moscow",
    ]);
    expect(source.records[0]).toMatchObject({
      id: "Europe/Moscow",
      timeZoneId: "Europe/Moscow",
      names: moscow.names,
      countryCode: "RU",
    });
  });

  it("should canonicalize and de-duplicate legacy identifiers", () => {
    const kyiv = {
      ...moscow,
      timeZoneId: "Europe/Kyiv",
      names: { en: "Kyiv", ru: "Киев" },
    };
    const source = createZoneCitiesSource([kyiv], () => [
      "Europe/Kiev",
      "Europe/Kyiv",
    ]);
    expect(idsOf(source)).toEqual(["Europe/Kyiv", "UTC"]);
  });

  it("should derive a name from the identifier when the data lacks the zone", () => {
    const source = createZoneCitiesSource([], () => [
      "America/Argentina/Buenos_Aires",
    ]);
    expect(source.records[0]).toMatchObject({
      names: { en: "Buenos Aires", ru: "Buenos Aires" },
      countryCode: "",
    });
  });

  it("should always include UTC", () => {
    const source = createZoneCitiesSource([moscow, utc], () => [
      "Europe/Moscow",
    ]);
    expect(idsOf(source)).toContain("UTC");
  });

  it("should not duplicate UTC when the list has it", () => {
    const source = createZoneCitiesSource([utc], () => ["UTC", "Etc/UTC"]);
    expect(idsOf(source)).toEqual(["UTC"]);
  });

  it("should use every data zone when the browser cannot list zones", () => {
    const source = createZoneCitiesSource([moscow, almaty], () => undefined);
    expect(idsOf(source)).toEqual(["Europe/Moscow", "Asia/Almaty", "UTC"]);
  });

  it("should use the browser zone list by default and drop data zones it lacks", () => {
    const source = createZoneCitiesSource([
      moscow,
      { ...moscow, timeZoneId: "Mars/Olympus_Mons" },
    ]);
    expect(idsOf(source)).toContain("Europe/Moscow");
    expect(idsOf(source)).not.toContain("Mars/Olympus_Mons");
  });

  it("should rank popular zones by distance from the end of the popular list", () => {
    const source = createZoneCitiesSource([moscow, almaty, utc], () => [
      "Europe/Moscow",
      "Asia/Almaty",
      "UTC",
    ]);
    const rankOf = (id: string) =>
      source.records.find((record) => record.id === id)?.rank;
    expect(rankOf("UTC")).toBe(POPULAR_TIME_ZONE_IDS.length);
    expect(rankOf("Europe/Moscow")).toBe(
      POPULAR_TIME_ZONE_IDS.length -
        POPULAR_TIME_ZONE_IDS.indexOf("Europe/Moscow"),
    );
  });

  it("should give an unpopular zone rank zero", () => {
    const source = createZoneCitiesSource(
      [{ ...almaty, timeZoneId: "Asia/Qyzylorda" }],
      () => ["Asia/Qyzylorda"],
    );
    expect(source.records[0]?.rank).toBe(0);
  });

  it("should list the abbreviations of a zone as aliases", () => {
    const source = createZoneCitiesSource([moscow], () => ["Europe/Moscow"]);
    expect(source.records[0]?.aliases).toEqual(["MSK"]);
  });
});

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
