// Verifies FR5 of set-home-location-and-show-differences (D4): offset difference.
import { describe, expect, it } from "vitest";
import { Temporal } from "@/lib/temporal";
import { buildLocation, KNOWN_CITIES } from "@/test/factories/buildLocation";
import { INITIAL_WORLD_CLOCK_STATE, type WorldClockState } from "./locations";
import {
  getOffsetDifferenceMinutes,
  getReferenceOffsetMinutes,
} from "./offsetDifference";
import { getUtcOffsetMinutes } from "./utcOffset";

const city = (cityName: string) =>
  buildLocation({ label: cityName, ...KNOWN_CITIES[cityName] });
const instantOf = (iso: string) => Temporal.Instant.from(iso);
const INSTANT = "2026-01-15T10:30:00Z";

/** Difference of a row against a reference zone, as `useLocations` feeds it. */
function differenceOf(
  location: { id: string; timeZoneId: string },
  referenceZone: string,
  context: { deviceTimeZoneId: string; homeLocationId: string | null },
  iso = INSTANT,
) {
  const instant = instantOf(iso);
  return getOffsetDifferenceMinutes(
    location,
    getUtcOffsetMinutes(location.timeZoneId, instant),
    getUtcOffsetMinutes(referenceZone, instant),
    context,
  );
}

const almaty = city("Almaty");
const homeContext = {
  deviceTimeZoneId: "Europe/Moscow",
  homeLocationId: almaty.id,
};

describe("getOffsetDifferenceMinutes", () => {
  it.each([
    ["Moscow", "Asia/Almaty", -120],
    ["Kolkata", "Asia/Almaty", 30],
    ["New York", "Asia/Almaty", -600],
  ])("should give %s against %s: %i", (cityName, referenceZone, expected) => {
    const context = {
      deviceTimeZoneId: "Europe/Moscow",
      homeLocationId: almaty.id,
    };

    expect(differenceOf(city(cityName), referenceZone, context)).toBe(expected);
  });

  it("should change with daylight saving time", () => {
    const newYork = city("New York");

    expect(
      differenceOf(newYork, "Asia/Almaty", homeContext, "2026-07-15T10:30:00Z"),
    ).toBe(-540);
  });

  it("should give none for the home row", () => {
    expect(differenceOf(almaty, "Asia/Almaty", homeContext)).toBeUndefined();
  });

  it("should give none for a row in the device zone without home", () => {
    const context = { deviceTimeZoneId: "Europe/Moscow", homeLocationId: null };

    expect(
      differenceOf(city("Moscow"), "Europe/Moscow", context),
    ).toBeUndefined();
  });

  it("should give the difference of the device zone row while home is set", () => {
    expect(differenceOf(city("Moscow"), "Asia/Almaty", homeContext)).toBe(-120);
  });

  it("should give 0 for another zone with the same offset", () => {
    const moscowHome = city("Moscow");
    const context = {
      deviceTimeZoneId: "Asia/Almaty",
      homeLocationId: moscowHome.id,
    };

    expect(differenceOf(city("Minsk"), "Europe/Moscow", context)).toBe(0);
  });

  it.each([
    [undefined, 300],
    [300, undefined],
  ])(
    "should give none when an offset is unknown (%s, %s)",
    (rowOffset, referenceOffset) => {
      expect(
        getOffsetDifferenceMinutes(
          city("Moscow"),
          rowOffset,
          referenceOffset,
          homeContext,
        ),
      ).toBeUndefined();
    },
  );
});

describe("getReferenceOffsetMinutes", () => {
  const state = (overrides: Partial<WorldClockState>): WorldClockState => ({
    ...INITIAL_WORLD_CLOCK_STATE,
    deviceTimeZoneId: "Europe/Moscow",
    ...overrides,
  });

  it("should read the home zone when home is set", () => {
    const withHome = state({ locations: [almaty], homeLocationId: almaty.id });

    expect(getReferenceOffsetMinutes(withHome, instantOf(INSTANT))).toBe(300);
  });

  it("should read the device zone without home", () => {
    expect(getReferenceOffsetMinutes(state({}), instantOf(INSTANT))).toBe(180);
  });
});
