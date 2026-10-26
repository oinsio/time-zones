// Verifies FR6, NFR-P2 of add-time-sliders-to-location-cards (D4).
import { describe, expect, it } from "vitest";
import { Temporal } from "@/lib/temporal";
import { DayPeriod } from "./dayPeriods";
import { collectBlendWindows, collectOffsetEdges } from "./dayPeriodWindows";
import { getReferenceDay } from "./dayTrack";
import { INITIAL_LOCATIONS_STATE } from "./locations";

const DAY = getReferenceDay(
  { ...INITIAL_LOCATIONS_STATE, deviceTimeZoneId: "Asia/Almaty" },
  Temporal.Instant.from("2026-03-08T07:30:00Z"),
);

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
