// Verifies FR2, FR9, FR10 of add-day-colouring-setting.
// Verifies FR3 of fix-day-track-handle-overlap-and-end-of-day.
// Verifies FR2, FR7, FR9, NFR-A3 of add-time-sliders-to-location-cards (D5).
// Verifies FR5, FR7, FR8 of bind-day-periods-to-sun.

import i18n from "i18next";
import { describe, expect, it } from "vitest";
import { Temporal } from "@/lib/temporal";
import type { InterfaceLanguageCode } from "@/locales";
import {
  getDayPeriodStops,
  getReferenceDay,
  INITIAL_WORLD_CLOCK_STATE,
} from "@/model";
import { DayColouring, DEFAULT_WORKING_HOURS, HourFormat } from "@/preferences";
import { TIME_OF_DAY_CONTEXT } from "@/test/dayColouringContext";
import { DayColour, presentDayColourStops } from "./dayColours";
import {
  type DayTrackContext,
  formatHourLabel,
  presentDayTrack,
} from "./dayTrack";

const INSTANT = Temporal.Instant.from("2026-03-08T07:30:00Z");
const PRECISION = 6;
const ALMATY_COORDINATES = { latitude: 43.3, longitude: 76.9 };
const DAY = getReferenceDay(
  { ...INITIAL_WORLD_CLOCK_STATE, deviceTimeZoneId: "Asia/Almaty" },
  INSTANT,
);

const contextFor = (
  timeZoneId: string,
  language: InterfaceLanguageCode = "en",
  localTimeLabel = "12:30",
  localDateLabel = "Sun, Mar 8",
) => ({
  timeZoneId,
  coordinates: ALMATY_COORDINATES,
  instant: INSTANT,
  day: DAY,
  language,
  hourFormat: HourFormat.H24,
  ...TIME_OF_DAY_CONTEXT,
  translate: i18n.getFixedT(language),
  localTimeLabel,
  localDateLabel,
});

const present = (
  timeZoneId: string,
  language: InterfaceLanguageCode = "en",
  localTimeLabel = "12:30",
  localDateLabel = "Sun, Mar 8",
  overrides: Partial<DayTrackContext> = {},
) =>
  presentDayTrack({
    ...contextFor(timeZoneId, language, localTimeLabel, localDateLabel),
    ...overrides,
  });

const labelsOf = (timeZoneId: string) =>
  present(timeZoneId).hourLabels.map((hourLabel) => hourLabel.label);

describe("presentDayTrack", () => {
  it.each([
    ["Asia/Almaty", ["00", "06", "12", "18", "00"]],
    ["Europe/Moscow", ["22", "04", "10", "16", "22"]],
    ["Asia/Kolkata", ["00:30", "06:30", "12:30", "18:30", "00:30"]],
    ["America/New_York", ["14", "20", "03", "09", "15"]],
    ["Asia/Kathmandu", ["00:45", "06:45", "12:45", "18:45", "00:45"]],
  ])("should label %s with its local hours", (zone, expected) => {
    expect(labelsOf(zone)).toEqual(expected);
  });

  it("should place the labels at 0, a quarter, a half, three quarters and 1", () => {
    expect(
      present("Asia/Almaty").hourLabels.map((hourLabel) => hourLabel.fraction),
    ).toEqual([0, 0.25, 0.5, 0.75, 1]);
  });

  it.each([
    ["en" as const, "12:30", "Sun, Mar 8", "12:30, Sun, Mar 8"],
    ["ru" as const, "12:30", "вс, 8 мар.", "12:30, вс, 8 мар."],
  ])("should word the value text in %s", (language, time, date, expected) => {
    expect(present("Asia/Almaty", language, time, date).valueText).toBe(
      expected,
    );
  });

  it("should expose the position and range", () => {
    const track = present("Asia/Almaty");

    expect(track.fraction).toBeCloseTo(0.520833, PRECISION);
    expect(track.valueMinutes).toBe(750);
    expect(track.maxMinutes).toBe(1439);
  });

  it("should present the day-period stops of the model as day colours in Time of day", () => {
    expect(present("Asia/Almaty").stops).toBe(
      presentDayColourStops(
        "Asia/Almaty",
        ALMATY_COORDINATES,
        DAY,
        DayColouring.TIME_OF_DAY,
        DEFAULT_WORKING_HOURS,
      ),
    );
    expect(present("Asia/Almaty").stops[0]).toEqual({
      fraction: getDayPeriodStops(ALMATY_COORDINATES, DAY)?.[0].fraction,
      colour: DayColour.NIGHT,
    });
  });

  it("should colour a track without coordinates in one neutral stop", () => {
    expect(
      present("UTC", "en", "12:30", "Sun, Mar 8", { coordinates: undefined })
        .stops,
    ).toEqual([{ fraction: 0, colour: DayColour.NO_DAY_PERIOD }]);
  });

  it("should give Plain one plain stop", () => {
    expect(
      present("Asia/Almaty", "en", "12:30", "Sun, Mar 8", {
        dayColouring: DayColouring.PLAIN,
      }).stops,
    ).toEqual([{ fraction: 0, colour: DayColour.PLAIN }]);
  });

  it("should give Working hours the Almaty Monday stops", () => {
    const monday = getReferenceDay(
      { ...INITIAL_WORLD_CLOCK_STATE, deviceTimeZoneId: "Asia/Almaty" },
      Temporal.Instant.from("2026-03-09T06:00:00Z"),
    );
    const { stops } = presentDayTrack({
      ...contextFor("Asia/Almaty"),
      day: monday,
      dayColouring: DayColouring.WORKING_HOURS,
    });
    expect(stops.map((stop) => stop.colour)).toEqual([
      DayColour.NON_WORKING_TIME,
      DayColour.WORKING_TIME,
      DayColour.WORKING_TIME,
      DayColour.NON_WORKING_TIME,
    ]);
    expect(stops[0].fraction).toBeCloseTo(0.416667, PRECISION);
  });

  it("should reuse the labels within one day and language", () => {
    expect(present("Asia/Almaty").hourLabels).toBe(
      present("Asia/Almaty").hourLabels,
    );
  });

  it("should relabel for another language", () => {
    const english = present("Asia/Almaty").hourLabels;

    expect(present("Asia/Almaty", "ru").hourLabels).not.toBe(english);
  });
});

// FR5, UX1 of replace-wall-clock-row-budgets-with-deterministic-checks
describe("formatHourLabel (characterization)", () => {
  it.each([
    ["en", "Asia/Kolkata", "2026-07-15T12:00:00Z", "17:30"],
    ["en", "Asia/Kathmandu", "2026-07-15T12:00:00Z", "17:45"],
    ["en", "America/New_York", "2026-07-15T12:00:00Z", "08"],
    ["en", "America/New_York", "2026-03-08T06:59:00Z", "01:59"],
    ["en", "America/New_York", "2026-03-08T07:00:00Z", "03"],
    ["ru", "Asia/Kolkata", "2026-07-15T12:00:00Z", "17:30"],
    ["ru", "Asia/Kathmandu", "2026-07-15T12:00:00Z", "17:45"],
    ["ru", "America/New_York", "2026-07-15T12:00:00Z", "08"],
    ["ru", "America/New_York", "2026-03-08T06:59:00Z", "01:59"],
    ["ru", "America/New_York", "2026-03-08T07:00:00Z", "03"],
  ] as const)(
    "should label %s %s at %s as %s",
    (language, zone, timestamp, expected) => {
      const localDateTime =
        Temporal.Instant.from(timestamp).toZonedDateTimeISO(zone);

      expect(formatHourLabel(localDateTime, language, HourFormat.H24)).toBe(
        expected,
      );
    },
  );
});
