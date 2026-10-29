// Verifies FR2, FR3, FR10, NFR-A2 of show-here-entry-for-device-time (D2, D8).
import i18n from "i18next";
import { describe, expect, it } from "vitest";
import type { SupportedLanguage } from "@/i18n";
import { fakeClock } from "@/lib/temporal";
import { getUtcOffsetMinutes, type Location, LocationMarkKind } from "@/model";
import { buildLocation, KNOWN_CITIES } from "@/test/factories/buildLocation";
import { buildReferenceDay } from "@/test/referenceDay";
import { presentHereEntry } from "./presentHereEntry";
import { presentLocationRows } from "./presentLocationRows";

const instant = fakeClock("2026-03-08T07:30:00Z").instant();
const city = (cityName: string): Location =>
  buildLocation({ label: cityName, ...KNOWN_CITIES[cityName] });

const contextOf = (
  deviceTimeZoneId: string,
  homeCity?: string,
  language: SupportedLanguage = "ru",
) => {
  const home = homeCity === undefined ? undefined : city(homeCity);
  const referenceZone = home?.timeZoneId ?? deviceTimeZoneId;
  return {
    language,
    instant,
    translate: i18n.getFixedT(language),
    deviceTimeZoneId,
    homeLocationId: home?.id ?? null,
    referenceOffsetMinutes: getUtcOffsetMinutes(referenceZone, instant),
    referenceDay: buildReferenceDay(instant, referenceZone),
  };
};

describe("presentHereEntry", () => {
  it("should present the design sample without home", () => {
    const presented = presentHereEntry(
      { timeZoneId: "Asia/Almaty" },
      "Алматы",
      contextOf("Asia/Almaty"),
    );

    expect(presented).toMatchObject({
      cityLabel: "Алматы",
      mark: { kind: LocationMarkKind.HERE, caption: "здесь" },
      metaLabel: "Время устройства · UTC+5",
      localTimeLabel: "12:30",
      localDateLabel: "вс, 8 мар.",
      offsetDifferenceLabel: "",
    });
  });

  it("should give the same day track as a location row in the zone", () => {
    const context = contextOf("Asia/Almaty");
    const [row] = presentLocationRows([city("Almaty")], context);

    expect(
      presentHereEntry({ timeZoneId: "Asia/Almaty" }, "Almaty", context)
        .dayTrack,
    ).toEqual(row.dayTrack);
  });

  it("should show the difference from home while travelling", () => {
    const presented = presentHereEntry(
      { timeZoneId: "Europe/Moscow" },
      "Москва",
      contextOf("Europe/Moscow", "Almaty"),
    );

    expect(presented).toMatchObject({
      offsetDifferenceLabel: "−2 ч",
      metaLabel: "Время устройства · UTC+3",
    });
  });

  it("should show 0 for home with the same offset", () => {
    const presented = presentHereEntry(
      { timeZoneId: "Europe/Minsk" },
      "Minsk",
      contextOf("Europe/Minsk", "Moscow"),
    );

    expect(presented.offsetDifferenceLabel).toBe("0 ч");
  });

  it.each([
    ["UTC", "en", "Device time · UTC"],
    ["Asia/Kolkata", "en", "Device time · UTC+5:30"],
  ] as const)(
    "should word the meta line for %s in %s",
    (zone, language, meta) => {
      const presented = presentHereEntry(
        { timeZoneId: zone },
        "City",
        contextOf(zone, undefined, language),
      );

      expect(presented.metaLabel).toBe(meta);
    },
  );

  it("should name the entry for assistive technology", () => {
    const presented = presentHereEntry(
      { timeZoneId: "Asia/Almaty" },
      "Алматы",
      contextOf("Asia/Almaty"),
    );

    expect(presented.accessibleName).toBe("Алматы, Вы здесь, Время устройства");
  });
});
