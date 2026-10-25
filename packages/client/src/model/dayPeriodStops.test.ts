// Verifies FR6, NFR-P2 of add-time-sliders-to-location-cards (D4).
import { describe, expect, it } from "vitest";
import { Temporal } from "@/lib/temporal";
import {
  assembleDayPeriodStops,
  collectBlendWindows,
  collectOffsetEdges,
  getDayPeriodStops,
} from "./dayPeriodStops";
import { DAY_PERIOD_SCHEDULE, DayPeriod, getDayPeriod } from "./dayPeriods";
import { getReferenceDay } from "./dayTrack";
import { INITIAL_LOCATIONS_STATE } from "./locations";

const PRECISION = 6;
const QUARTER_HOURS_PER_DAY = 96;
const ALMATY_STATE = {
  ...INITIAL_LOCATIONS_STATE,
  deviceTimeZoneId: "Asia/Almaty",
};
const DAY = getReferenceDay(
  ALMATY_STATE,
  Temporal.Instant.from("2026-03-08T07:30:00Z"),
);

const ALMATY_STOPS: [number, DayPeriod][] = [
  [0.270833, DayPeriod.NIGHT],
  [0.3125, DayPeriod.MORNING],
  [0.369792, DayPeriod.MORNING],
  [0.380208, DayPeriod.WORK],
  [0.744792, DayPeriod.WORK],
  [0.755208, DayPeriod.EVENING],
  [0.895833, DayPeriod.EVENING],
  [0.9375, DayPeriod.NIGHT],
];
const NEW_YORK_STOPS: [number, DayPeriod][] = [
  [0.161458, DayPeriod.WORK],
  [0.171875, DayPeriod.EVENING],
  [0.3125, DayPeriod.EVENING],
  [0.354167, DayPeriod.NIGHT],
  [0.645833, DayPeriod.NIGHT],
  [0.6875, DayPeriod.MORNING],
  [0.744792, DayPeriod.MORNING],
  [0.755208, DayPeriod.WORK],
];

describe("getDayPeriodStops", () => {
  it.each([
    ["Asia/Almaty", ALMATY_STOPS],
    ["America/New_York", NEW_YORK_STOPS],
  ])("should give the stops of %s", (zone, expected) => {
    const actual = getDayPeriodStops(zone, DAY);

    expect(actual).toHaveLength(expected.length);
    actual.forEach((stop, index) => {
      expect(stop.fraction).toBeCloseTo(expected[index][0], PRECISION);
      expect(stop.period).toBe(expected[index][1]);
    });
  });

  it.each(["Asia/Almaty", "America/New_York"])(
    "should colour %s by its local period outside blend windows",
    (zone) => {
      const stops = getDayPeriodStops(zone, DAY);
      const windows = collectBlendWindows(zone, DAY);
      for (let step = 0; step < QUARTER_HOURS_PER_DAY; step++) {
        const instant = DAY.start.add({ minutes: step * 15 });
        const isInsideBlend = windows.some(
          (window) =>
            Temporal.Instant.compare(instant, window.start) >= 0 &&
            Temporal.Instant.compare(instant, window.end) <= 0,
        );
        if (isInsideBlend) continue;
        const fraction = (step * 15) / DAY.lengthMinutes;
        const passedStops = stops.filter((stop) => stop.fraction <= fraction);
        const shown = (passedStops.at(-1) ?? stops[0]).period;
        const local = instant.toZonedDateTimeISO(zone).toPlainTime();

        expect(shown).toBe(getDayPeriod(local, DAY_PERIOD_SCHEDULE));
      }
    },
  );

  it("should leave out the boundaries of a skipped local date", () => {
    const apiaDay = getReferenceDay(
      { ...INITIAL_LOCATIONS_STATE, deviceTimeZoneId: "UTC" },
      Temporal.Instant.from("2011-12-30T12:00:00Z"),
    );

    const stops = getDayPeriodStops("Pacific/Apia", apiaDay);

    expect(stops).toHaveLength(8);
  });

  it("should return the same array for the same zone and day", () => {
    expect(getDayPeriodStops("Asia/Almaty", DAY)).toBe(
      getDayPeriodStops("Asia/Almaty", DAY),
    );
  });

  it("should return a new array for another day", () => {
    const first = getDayPeriodStops("Asia/Almaty", DAY);
    const nextDay = getReferenceDay(
      ALMATY_STATE,
      Temporal.Instant.from("2026-03-09T07:30:00Z"),
    );

    expect(getDayPeriodStops("Asia/Almaty", nextDay)).not.toBe(first);
  });
});

describe("assembleDayPeriodStops", () => {
  it("should make two stops at one position for a hard edge", () => {
    const edge = {
      instant: DAY.start.add({ hours: 12 }),
      before: DayPeriod.EVENING,
      after: DayPeriod.NIGHT,
    };

    expect(assembleDayPeriodStops([], [edge], DAY)).toEqual([
      { fraction: 0.5, period: DayPeriod.EVENING },
      { fraction: 0.5, period: DayPeriod.NIGHT },
    ]);
  });
});

describe("collectOffsetEdges", () => {
  it("should find no edge for New York on the Almaty day", () => {
    expect(collectOffsetEdges("America/New_York", DAY)).toEqual([]);
  });

  it("should find an edge when the offset change moves the period", () => {
    const day = getReferenceDay(
      { ...INITIAL_LOCATIONS_STATE, deviceTimeZoneId: "America/New_York" },
      Temporal.Instant.from("2026-03-08T12:00:00Z"),
    );
    const morningSchedule = [
      {
        wallTime: "02:30",
        from: DayPeriod.NIGHT,
        to: DayPeriod.MORNING,
        blendMinutes: 0,
      },
    ];

    const edges = collectOffsetEdges("America/New_York", day, morningSchedule);

    expect(edges).toHaveLength(1);
    expect(edges[0].before).toBe(DayPeriod.NIGHT);
    expect(edges[0].after).toBe(DayPeriod.MORNING);
  });
});

const NEW_YORK_STATE = {
  ...INITIAL_LOCATIONS_STATE,
  deviceTimeZoneId: "America/New_York",
};
const instantOf = (iso: string) => Temporal.Instant.from(iso);
const midnightSchedule = [
  {
    wallTime: "00:00",
    from: DayPeriod.EVENING,
    to: DayPeriod.NIGHT,
    blendMinutes: 0,
  },
];

describe("collectBlendWindows", () => {
  it("should use the earlier occurrence of a repeated wall time", () => {
    const day = getReferenceDay(
      NEW_YORK_STATE,
      instantOf("2026-11-01T12:00:00Z"),
    );
    const repeatedSchedule = [
      {
        wallTime: "01:30",
        from: DayPeriod.EVENING,
        to: DayPeriod.NIGHT,
        blendMinutes: 0,
      },
    ];

    const windows = collectBlendWindows(
      "America/New_York",
      day,
      repeatedSchedule,
    );

    expect(windows.map((window) => window.start.toString())).toEqual([
      "2026-11-01T05:30:00Z",
    ]);
  });

  it("should keep windows that touch the start or the end of the day", () => {
    const day = getReferenceDay(
      { ...INITIAL_LOCATIONS_STATE, deviceTimeZoneId: "UTC" },
      instantOf("2026-07-15T12:00:00Z"),
    );

    const windows = collectBlendWindows("UTC", day, midnightSchedule);

    expect(windows.map((window) => window.start.toString())).toEqual([
      "2026-07-15T00:00:00Z",
      "2026-07-16T00:00:00Z",
    ]);
  });
});

describe("collectOffsetEdges at the end of the day", () => {
  it("should leave out a change exactly at the end", () => {
    const day = {
      start: instantOf("2026-03-08T00:00:00Z"),
      end: instantOf("2026-03-08T07:00:00Z"),
      lengthMinutes: 420,
    };
    const nightToMorning = [
      {
        wallTime: "02:30",
        from: DayPeriod.NIGHT,
        to: DayPeriod.MORNING,
        blendMinutes: 0,
      },
    ];

    expect(collectOffsetEdges("America/New_York", day, nightToMorning)).toEqual(
      [],
    );
  });
});

describe("assembleDayPeriodStops order", () => {
  it("should sort the stops by position", () => {
    const edges = [0.75, 0.25].map((fraction) => ({
      instant: DAY.start.add({ minutes: fraction * DAY.lengthMinutes }),
      before: DayPeriod.EVENING,
      after: DayPeriod.NIGHT,
    }));

    const fractions = assembleDayPeriodStops([], edges, DAY).map(
      (stop) => stop.fraction,
    );

    expect(fractions).toEqual([0.25, 0.25, 0.75, 0.75]);
  });
});
