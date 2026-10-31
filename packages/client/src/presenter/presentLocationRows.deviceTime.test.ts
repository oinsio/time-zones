// Verifies FR8, UX3 of add-settings-page-and-device-time-location (D4): the device time row.
// Verifies FR5 of add-settings-page-and-device-time-location (D8): the 12-hour rows.
import i18n from "i18next";
import { describe, expect, it } from "vitest";
import type { SupportedLanguage } from "@/i18n";
import { fakeClock } from "@/lib/temporal";
import { buildDeviceTimeLocation } from "@/model";
import { HourFormat } from "@/preferences";
import { buildLocation, KNOWN_CITIES } from "@/test/factories/buildLocation";
import { buildReferenceDay } from "@/test/referenceDay";
import { presentLocationRows } from "./presentLocationRows";

const instant = fakeClock("2026-03-08T07:30:00Z").instant();
const DEVICE_ZONE = "Asia/Almaty";

const present = (
  locations: Parameters<typeof presentLocationRows>[0],
  language: SupportedLanguage = "en",
  overrides: Partial<Parameters<typeof presentLocationRows>[1]> = {},
) =>
  presentLocationRows(locations, {
    language,
    hourFormat: HourFormat.H24,
    instant,
    deviceTimeZoneId: DEVICE_ZONE,
    homeLocationId: null,
    referenceOffsetMinutes: undefined,
    referenceDay: buildReferenceDay(instant, DEVICE_ZONE),
    translate: i18n.getFixedT(language),
    deviceTimeCityLabel: "Almaty",
    ...overrides,
  });

const deviceTime = buildDeviceTimeLocation(DEVICE_ZONE);

describe("the device time row", () => {
  it("should take its city from the exemplar city and have no country", () => {
    const [row] = present([deviceTime]);
    expect(row?.cityLabel).toBe("Almaty");
    expect(row?.countryName).toBe("");
  });

  it("should fall back to the zone ID before the exemplar city is known", () => {
    const [row] = present([deviceTime], "en", {
      deviceTimeCityLabel: undefined,
    });
    expect(row?.cityLabel).toBe(DEVICE_ZONE);
  });

  it("should have the Here mark", () => {
    const [row] = present([deviceTime]);
    expect(row?.mark?.accessibleLabel).toBe("You are here");
  });

  it.each([
    ["en", "Device time · UTC+5"],
    ["ru", "Время устройства · UTC+5"],
  ] as const)("should have the %s meta line", (language, expected) => {
    expect(present([deviceTime], language)[0]?.metaLabel).toBe(expected);
  });

  it.each([
    ["en", "Almaty, You are here, Device time"],
    ["ru", "Almaty, Вы здесь, Время устройства"],
  ] as const)("should have the %s accessible name", (language, expected) => {
    expect(present([deviceTime], language)[0]?.accessibleName).toBe(expected);
  });

  it("should have the Home mark and name while home", () => {
    const [row] = present([deviceTime], "en", {
      homeLocationId: deviceTime.id,
    });
    expect(row?.mark?.accessibleLabel).toBe("Home location");
    expect(row?.accessibleName).toBe("Almaty, Home location, Device time");
  });

  it("should have no offset difference without home", () => {
    expect(present([deviceTime])[0]?.offsetDifferenceLabel).toBe("");
  });

  it("should leave a city row without a meta line or accessible name", () => {
    const [row] = present([
      buildLocation({ ...KNOWN_CITIES.Moscow, label: "Moscow" }),
    ]);
    expect(row?.metaLabel).toBeUndefined();
    expect(row?.accessibleName).toBeUndefined();
  });
});

describe("rows in the 12-hour format", () => {
  const collapse = (text: string | undefined) => text?.replace(/\s/g, " ");

  it("should write the local time of New York with a day period", () => {
    const newYork = buildLocation({
      timeZoneId: "America/New_York",
      label: "New York",
      countryCode: "US",
    });
    const [row] = present([newYork], "en", { hourFormat: HourFormat.H12 });
    expect(collapse(row?.localTimeLabel)).toBe("3:30 AM");
  });

  it("should write the local time of Kathmandu with a day period", () => {
    const kathmandu = buildLocation({
      timeZoneId: "Asia/Kathmandu",
      label: "Kathmandu",
      countryCode: "NP",
    });
    const [row] = present([kathmandu], "en", { hourFormat: HourFormat.H12 });
    expect(collapse(row?.localTimeLabel)).toBe("1:15 PM");
  });

  it("should write the hour labels of the day track in the 12-hour format", () => {
    const moscow = buildLocation();
    const [row] = present([moscow], "en", { hourFormat: HourFormat.H12 });
    expect(
      row?.dayTrack?.hourLabels.map((hourLabel) => collapse(hourLabel.label)),
    ).toEqual(["10 PM", "4 AM", "10 AM", "4 PM", "10 PM"]);
  });

  it("should write the half-hour labels of Kolkata in the 12-hour format", () => {
    const kolkata = buildLocation({
      timeZoneId: "Asia/Kolkata",
      label: "Kolkata",
      countryCode: "IN",
    });
    const [row] = present([kolkata], "en", { hourFormat: HourFormat.H12 });
    expect(
      row?.dayTrack?.hourLabels.map((hourLabel) => collapse(hourLabel.label)),
    ).toEqual(["12:30 AM", "6:30 AM", "12:30 PM", "6:30 PM", "12:30 AM"]);
  });
});
