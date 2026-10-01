// Verifies FR10, UX4 of add-locations-via-search (D9).
// Verifies FR2, FR3, FR5, FR6, UX2 of show-utc-offset-on-location-rows (D2).
import i18n, { type TFunction } from "i18next";
import { describe, expect, it } from "vitest";
import type { SupportedLanguage } from "@/i18n";
import { fakeClock } from "@/lib/temporal";
import { buildLocation } from "@/test/factories/buildLocation";
import { presentLocationRows } from "./presentLocationRows";

const july = fakeClock("2026-07-15T12:00:00Z").instant();
const january = fakeClock("2026-01-15T12:00:00Z").instant();

const present = (
  locations: Parameters<typeof presentLocationRows>[0],
  language: SupportedLanguage = "en",
  options: { instant?: typeof july; translate?: TFunction } = {},
) =>
  presentLocationRows(locations, {
    language,
    instant: options.instant ?? july,
    translate: options.translate ?? i18n.getFixedT(language),
  });

describe("present location rows", () => {
  it("should keep the list order and show the city label", () => {
    const rows = present([
      buildLocation({
        label: "Almaty",
        timeZoneId: "Asia/Almaty",
        countryCode: "KZ",
      }),
      buildLocation(),
    ]);
    expect(rows.map((row) => row.cityLabel)).toEqual(["Almaty", "Moscow"]);
  });

  it("should carry the location id", () => {
    const location = buildLocation();
    expect(present([location])[0]?.id).toBe(location.id);
  });

  it.each([
    ["en", "KZ", "Kazakhstan"],
    ["ru", "RU", "Россия"],
    ["en", "RU", "Russia"],
  ] as const)(
    "should name the country in %s for %s",
    (language, countryCode, expected) => {
      const rows = present([buildLocation({ countryCode })], language);
      expect(rows[0]?.countryName).toBe(expected);
    },
  );

  it("should give an empty country name for an empty code", () => {
    const rows = present([
      buildLocation({ label: "UTC", timeZoneId: "UTC", countryCode: "" }),
    ]);
    expect(rows[0]?.countryName).toBe("");
  });

  it("should give an empty country name for a code Intl does not know", () => {
    const rows = present([buildLocation({ countryCode: "QQ" })]);
    expect(rows[0]?.countryName).toBe("");
  });

  it("should show the offset of the location at the given instant", () => {
    expect(present([buildLocation()])[0]?.utcOffsetLabel).toBe("UTC+3");
  });

  it("should show the prefix alone for a zero offset", () => {
    const utc = buildLocation({
      label: "UTC",
      timeZoneId: "UTC",
      countryCode: "",
    });
    expect(present([utc])[0]?.utcOffsetLabel).toBe("UTC");
  });

  it("should respect daylight saving time for the given instant", () => {
    const newYork = buildLocation({
      label: "New York",
      timeZoneId: "America/New_York",
    });
    expect(
      present([newYork], "en", { instant: january })[0]?.utcOffsetLabel,
    ).toBe("UTC\u22125");
  });

  it("should take the UTC prefix from the translate function", () => {
    const translate = (() => "XYZ") as unknown as TFunction;
    expect(
      present([buildLocation()], "en", { translate })[0]?.utcOffsetLabel,
    ).toBe("XYZ+3");
  });

  it("should take the UTC prefix from the Russian locale", () => {
    expect(present([buildLocation()], "ru")[0]?.utcOffsetLabel).toBe("UTC+3");
  });

  it("should give an empty offset label and keep city and country for an unknown zone", () => {
    const row = present([
      buildLocation({ label: "Olympus", timeZoneId: "Mars/Olympus_Mons" }),
    ])[0];
    expect([row?.utcOffsetLabel, row?.cityLabel, row?.countryName]).toEqual([
      "",
      "Olympus",
      "Russia",
    ]);
  });
});
