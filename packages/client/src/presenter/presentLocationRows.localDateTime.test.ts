// Verifies FR1, FR2, FR6 of show-local-time-and-date-on-location-cards (D3).
import i18n, { type TFunction } from "i18next";
import { describe, expect, it } from "vitest";
import type { SupportedLanguage } from "@/i18n";
import { fakeClock } from "@/lib/temporal";
import { UNIT_TEST_DEVICE_TIME_ZONE } from "@/test/deviceTimeZone";
import { buildLocation, KNOWN_CITIES } from "@/test/factories/buildLocation";

import { presentLocationRows } from "./presentLocationRows";

const july = fakeClock("2026-07-15T12:00:00Z").instant();

const present = (
  locations: Parameters<typeof presentLocationRows>[0],
  language: SupportedLanguage = "en",
  options: {
    instant?: typeof july;
    translate?: TFunction;
    deviceTimeZoneId?: string;
  } = {},
) =>
  presentLocationRows(locations, {
    language,
    instant: options.instant ?? july,
    deviceTimeZoneId: options.deviceTimeZoneId ?? UNIT_TEST_DEVICE_TIME_ZONE,
    translate: options.translate ?? i18n.getFixedT(language),
  });

describe("present the local time and date", () => {
  const cityOf = (label: string) =>
    buildLocation({ label, ...KNOWN_CITIES[label] });
  const march = fakeClock("2026-03-08T07:30:00Z").instant();
  const tokyoMidnight = fakeClock("2026-03-08T16:00:00Z").instant();

  it("should show the time of each location at the given instant", () => {
    const rows = present([cityOf("Almaty"), cityOf("Moscow")], "en", {
      instant: march,
    });
    expect(rows.map((row) => row.localTimeLabel)).toEqual(["12:30", "10:30"]);
  });

  it("should show the date and its ISO form", () => {
    const row = present([cityOf("Almaty")], "en", { instant: march })[0];
    expect([row?.localDateLabel, row?.localIsoDate]).toEqual([
      "Sun, Mar 8",
      "2026-03-08",
    ]);
  });

  it("should use the date of the location's own zone", () => {
    const row = present([cityOf("Tokyo")], "en", {
      instant: tokyoMidnight,
    })[0];
    expect([
      row?.localTimeLabel,
      row?.localDateLabel,
      row?.localIsoDate,
    ]).toEqual(["01:00", "Mon, Mar 9", "2026-03-09"]);
  });

  it("should write the date in Russian", () => {
    const row = present([cityOf("Almaty")], "ru", { instant: march })[0];
    expect(row?.localDateLabel).toBe("вс, 8 мар.");
  });

  it("should give empty time and date for an unknown zone and keep the city", () => {
    const row = present(
      [buildLocation({ label: "Olympus", timeZoneId: "Mars/Olympus_Mons" })],
      "en",
      { instant: march },
    )[0];
    expect([
      row?.localTimeLabel,
      row?.localDateLabel,
      row?.localIsoDate,
      row?.cityLabel,
    ]).toEqual(["", "", "", "Olympus"]);
  });
});
