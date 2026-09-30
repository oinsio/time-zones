// Verifies FR1–FR3, FR9 of add-locations-via-search: the CLDR extraction.

import timeZoneAliases from "virtual:time-zone-aliases";
import zoneCities from "virtual:zone-cities";
import { describe, expect, it } from "vitest";
import { Temporal } from "@/lib/temporal";

const findRecord = (timeZoneId: string) =>
  zoneCities.find((record) => record.timeZoneId === timeZoneId);

describe("extracted zone cities", () => {
  it("should give every record non-empty English and Russian names", () => {
    const unnamed = zoneCities.filter(
      (record) => record.names.en === "" || record.names.ru === "",
    );
    expect(unnamed).toEqual([]);
  });

  it("should give every record an identifier Temporal accepts", () => {
    const rejected = zoneCities.filter((record) => {
      try {
        return new Temporal.ZonedDateTime(0n, record.timeZoneId) === undefined;
      } catch {
        return true;
      }
    });
    expect(rejected).toEqual([]);
  });

  it("should not use a legacy alias as a record identifier", () => {
    const legacy = zoneCities.filter(
      (record) => record.timeZoneId in timeZoneAliases,
    );
    expect(legacy).toEqual([]);
  });

  it("should give every record an empty or two-letter upper-case country code", () => {
    const malformed = zoneCities.filter(
      (record) => !/^([A-Z]{2})?$/.test(record.countryCode),
    );
    expect(malformed).toEqual([]);
  });

  it("should contain no Etc zone", () => {
    expect(zoneCities.filter((r) => r.timeZoneId.startsWith("Etc/"))).toEqual(
      [],
    );
  });

  it("should contain UTC without a country", () => {
    expect(findRecord("UTC")).toMatchObject({ countryCode: "" });
  });

  it("should contain Istanbul", () => {
    expect(findRecord("Europe/Istanbul")).toBeDefined();
  });

  it.each([
    ["Asia/Almaty", "KZ", "Almaty", "Алматы"],
    ["Europe/Moscow", "RU", "Moscow", "Москва"],
    ["America/Sao_Paulo", "BR", "São Paulo", undefined],
    ["Asia/Kolkata", "IN", undefined, "Калькутта"],
    ["Asia/Jerusalem", "IL", undefined, undefined],
    ["Asia/Gaza", "PS", undefined, undefined],
    ["America/Marigot", "MF", undefined, undefined],
    ["Asia/Chita", "RU", undefined, undefined],
  ])(
    "should map %s to %s",
    (timeZoneId, countryCode, englishName, russianName) => {
      const record = findRecord(timeZoneId);
      expect(record?.countryCode).toBe(countryCode);
      if (englishName) expect(record?.names.en).toBe(englishName);
      if (russianName) expect(record?.names.ru).toBe(russianName);
    },
  );

  it.each([
    ["Asia/Calcutta", "Asia/Kolkata"],
    ["Europe/Zaporozhye", "Europe/Kyiv"],
    ["Etc/UTC", "UTC"],
  ])("should map the legacy alias %s to %s", (alias, canonical) => {
    expect(timeZoneAliases[alias]).toBe(canonical);
  });
});
