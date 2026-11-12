// Verifies FR2, FR3 of add-locations-via-search (D7); FR5, FR9 of add-zone-rules-from-iana (D6).
import { describe, expect, it } from "vitest";
import { installZoneRulesDateTimeFormat } from "@/lib/zoneRules";
import { SearchMatchKind } from "@/ports";
import {
  installStaleEngine,
  restoreEngine,
} from "@/test/fakeStaleDateTimeFormat";
import { committedRelease } from "@/test/installZoneRules";

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

  it("should filter out a record whose zone is not in the installed release", () => {
    const unknownZone = { ...moscow, timeZoneId: "Mars/Olympus_Mons" };
    expect(idsOf(createZoneCitiesSource([moscow, unknownZone]))).not.toContain(
      "Mars/Olympus_Mons",
    );
  });

  it("should keep every record when no release is installed", () => {
    expect(
      idsOf(createZoneCitiesSource([moscow, almaty], () => undefined)),
    ).toEqual(["Europe/Moscow", "Asia/Almaty", "UTC"]);
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

describe("zone cities source on the installed release", () => {
  const ciudadJuarez = {
    timeZoneId: "America/Ciudad_Juarez",
    names: { en: "Ciudad Juárez", ru: "Сьюдад-Хуарес" },
    countryCode: "MX",
  };

  it("should offer a zone the engine rejects", () => {
    installStaleEngine({
      staleZones: {},
      rejectedZones: ["America/Ciudad_Juarez"],
    });
    installZoneRulesDateTimeFormat(committedRelease);
    try {
      expect(idsOf(createZoneCitiesSource([moscow, ciudadJuarez]))).toContain(
        "America/Ciudad_Juarez",
      );
    } finally {
      restoreEngine();
    }
  });

  it("should offer no zone of the Etc area and no area-less zone but UTC", () => {
    const offeredIds = idsOf(createZoneCitiesSource([moscow]));
    expect(offeredIds.filter((id) => id.startsWith("Etc/"))).toEqual([]);
    expect(offeredIds.filter((id) => !id.includes("/"))).toEqual(["UTC"]);
  });

  it.each(["Etc/GMT+5", "EST5EDT", "CET"])("should not offer %s", (zoneId) => {
    expect(idsOf(createZoneCitiesSource([moscow]))).not.toContain(zoneId);
  });

  it("should offer Europe/Oslo", () => {
    expect(idsOf(createZoneCitiesSource([moscow]))).toContain("Europe/Oslo");
  });
});
