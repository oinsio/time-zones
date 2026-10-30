// Verifies FR5, FR7 of set-home-location-and-show-differences (D3-D5): home mark and differences in rows.

import i18n from "i18next";
import { describe, expect, it } from "vitest";
import type { SupportedLanguage } from "@/i18n";
import { fakeClock } from "@/lib/temporal";
import { getUtcOffsetMinutes, type Location } from "@/model";
import { HourFormat } from "@/preferences";
import { buildLocation, KNOWN_CITIES } from "@/test/factories/buildLocation";
import { buildReferenceDay } from "@/test/referenceDay";
import { presentLocationRows } from "./presentLocationRows";

const instant = fakeClock("2026-03-08T07:30:00Z").instant();
const city = (cityName: string): Location =>
  buildLocation({ label: cityName, ...KNOWN_CITIES[cityName] });

const present = (
  cities: string[],
  {
    deviceTimeZoneId,
    homeCity,
    language = "en",
  }: {
    deviceTimeZoneId: string;
    homeCity?: string;
    language?: SupportedLanguage;
  },
) => {
  const locations = cities.map(city);
  const home = homeCity === undefined ? undefined : city(homeCity);
  const referenceZone = home?.timeZoneId ?? deviceTimeZoneId;
  return presentLocationRows(locations, {
    language,
    hourFormat: HourFormat.H24,
    instant,
    translate: i18n.getFixedT(language),
    deviceTimeZoneId,
    homeLocationId: home?.id ?? null,
    referenceOffsetMinutes: getUtcOffsetMinutes(referenceZone, instant),
    referenceDay: buildReferenceDay(instant, referenceZone),
  });
};
const rowOf = (rows: ReturnType<typeof present>, cityName: string) =>
  rows.find((row) => row.cityLabel === cityName);

describe("present location rows with a home location", () => {
  const rows = present(["Almaty", "Moscow", "Kolkata", "New York"], {
    deviceTimeZoneId: "Asia/Almaty",
    homeCity: "Almaty",
  });

  it.each([
    ["Moscow", "−2 h", "2 hours behind"],
    ["Kolkata", "+0:30", "30 minutes ahead"],
    ["New York", "−9 h", "9 hours behind"],
  ])("should give %s the difference %s", (cityName, label, accessible) => {
    expect(rowOf(rows, cityName)).toMatchObject({
      offsetDifferenceLabel: label,
      offsetDifferenceAccessibleLabel: accessible,
    });
  });

  it("should give the home row no difference", () => {
    expect(rowOf(rows, "Almaty")).toMatchObject({
      offsetDifferenceLabel: "",
      offsetDifferenceAccessibleLabel: "",
    });
  });

  it("should give the home row the home mark without a caption", () => {
    expect(rowOf(rows, "Almaty")?.mark).toEqual({
      kind: "home",
      accessibleLabel: "Home location",
      caption: "",
    });
  });

  it("should give the home mark its Russian name", () => {
    const russianRows = present(["Almaty"], {
      deviceTimeZoneId: "Asia/Almaty",
      homeCity: "Almaty",
      language: "ru",
    });

    expect(russianRows[0]?.mark?.accessibleLabel).toBe("Домашнее место");
  });
});

describe("present location rows while travelling", () => {
  const rows = present(["Almaty", "Moscow"], {
    deviceTimeZoneId: "Europe/Moscow",
    homeCity: "Almaty",
  });

  it("should give the device zone row the here mark and its difference", () => {
    const moscow = rowOf(rows, "Moscow");

    expect(moscow?.mark?.kind).toBe("here");
    expect(moscow?.mark?.caption).toBe("here");
    expect(moscow?.offsetDifferenceLabel).toBe("−2 h");
  });
});

describe("present location rows without a home location", () => {
  const rows = present(["Almaty", "Moscow"], {
    deviceTimeZoneId: "Asia/Almaty",
  });

  it("should give the here row no difference and the others the device one", () => {
    expect(rowOf(rows, "Almaty")?.offsetDifferenceLabel).toBe("");
    expect(rowOf(rows, "Moscow")?.offsetDifferenceLabel).toBe("−2 h");
  });
});
