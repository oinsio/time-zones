// Verifies FR8, FR10, FR11, NFR-P1 of add-day-colouring-setting.
import { describe, expect, it } from "vitest";
import { Temporal } from "@/lib/temporal";
import { getReferenceDay } from "./dayTrack";
import { INITIAL_WORLD_CLOCK_STATE } from "./locations";
import {
  getHourCellWorkingFlags,
  getWorkingTimeSpans,
  getWorkingTimeStops,
  isWorkingDay,
  isWorkingTime,
} from "./workingTime";

const PRECISION = 6;
const ALMATY = "Asia/Almaty";
const MOSCOW = "Europe/Moscow";
const NEW_YORK = "America/New_York";
const CAIRO = "Africa/Cairo";
const TEN_TO_SIX = { start: "10:00", end: "18:00" };

const dayIn = (referenceZoneId: string, instant: string) =>
  getReferenceDay(
    { ...INITIAL_WORLD_CLOCK_STATE, deviceTimeZoneId: referenceZoneId },
    Temporal.Instant.from(instant),
  );

const hours = (start: string, end: string) => ({ start, end });

const columnsOf = (flags: readonly boolean[]) =>
  flags.flatMap((isWorking, column) => (isWorking ? [column] : []));

const range = (first: number, last: number) =>
  Array.from({ length: last - first + 1 }, (_, offset) => first + offset);

describe("isWorkingDay", () => {
  it.each([
    ["2026-03-09", true],
    ["2026-03-10", true],
    ["2026-03-11", true],
    ["2026-03-12", true],
    ["2026-03-13", true],
    ["2026-03-14", false],
    ["2026-03-15", false],
  ])("should answer %s with %s", (date, expected) => {
    expect(isWorkingDay(Temporal.PlainDate.from(date))).toBe(expected);
  });
});

describe("isWorkingTime", () => {
  it.each([
    [
      "Tokyo at the same moment is 16:00",
      "2026-03-09T07:00:00Z",
      "Asia/Tokyo",
      true,
    ],
    [
      "Moscow 15:00 is Tokyo 21:00",
      "2026-03-09T12:00:00Z",
      "Asia/Tokyo",
      false,
    ],
    [
      "Moscow at the Tokyo 10:00 moment is 04:00",
      "2026-03-09T01:00:00Z",
      MOSCOW,
      false,
    ],
    ["Tokyo 10:00 itself", "2026-03-09T01:00:00Z", "Asia/Tokyo", true],
    ["the end is excluded", "2026-03-09T15:00:00Z", MOSCOW, false],
    ["a minute before the end", "2026-03-09T14:59:00Z", MOSCOW, true],
    ["a minute before the start", "2026-03-09T06:59:00Z", MOSCOW, false],
    ["a Saturday", "2026-03-14T09:00:00Z", MOSCOW, false],
    ["a Sunday", "2026-03-15T09:00:00Z", MOSCOW, false],
    [
      "Friday in New York while Saturday in Moscow",
      "2026-03-13T20:00:00Z",
      NEW_YORK,
      true,
    ],
  ])("should answer %s", (_, instant, zone, expected) => {
    expect(
      isWorkingTime(Temporal.Instant.from(instant), zone, TEN_TO_SIX),
    ).toBe(expected);
  });
});

describe("getWorkingTimeStops", () => {
  const monday = dayIn(ALMATY, "2026-03-09T06:00:00Z");
  it.each([
    [
      "10:00",
      "18:00",
      ALMATY,
      [
        [0.416667, false],
        [0.416667, true],
        [0.75, true],
        [0.75, false],
      ],
    ],
    [
      "09:07",
      "18:00",
      ALMATY,
      [
        [0.379861, false],
        [0.379861, true],
        [0.75, true],
        [0.75, false],
      ],
    ],
    [
      "10:00",
      "18:00",
      MOSCOW,
      [
        [0.5, false],
        [0.5, true],
        [0.833333, true],
        [0.833333, false],
      ],
    ],
    [
      "10:00",
      "18:00",
      NEW_YORK,
      [
        [0.791667, false],
        [0.791667, true],
      ],
    ],
  ])("should give %s-%s in %s on a Monday", (start, end, zone, expected) => {
    const stops = getWorkingTimeStops(zone, monday, hours(start, end));
    expect(stops.map((stop) => stop.isWorkingTime)).toEqual(
      expected.map(([, isWorking]) => isWorking),
    );
    stops.forEach((stop, index) =>
      expect(stop.fraction).toBeCloseTo(
        expected[index][0] as number,
        PRECISION,
      ),
    );
  });

  it("should give Moscow one non-working stop at 0 on its Saturday", () => {
    const saturday = dayIn(MOSCOW, "2026-03-14T09:00:00Z");
    expect(getWorkingTimeStops(MOSCOW, saturday, TEN_TO_SIX)).toEqual([
      { fraction: 0, isWorkingTime: false },
    ]);
  });

  it("should give New York a Friday evening hour before its Saturday", () => {
    const saturday = dayIn(MOSCOW, "2026-03-14T09:00:00Z");
    const stops = getWorkingTimeStops(NEW_YORK, saturday, TEN_TO_SIX);
    expect(stops.map((stop) => stop.isWorkingTime)).toEqual([true, false]);
    expect(stops[0].fraction).toBeCloseTo(0.041667, PRECISION);
  });

  it("should read the hours after a clock change in Cairo", () => {
    const friday = dayIn(ALMATY, "2026-04-24T06:00:00Z");
    const stops = getWorkingTimeStops(CAIRO, friday, TEN_TO_SIX);
    expect(stops.map((stop) => stop.isWorkingTime)).toEqual([
      false,
      true,
      true,
      false,
    ]);
    expect(stops[1].fraction).toBeCloseTo(0.5, PRECISION);
    expect(stops[2].fraction).toBeCloseTo(0.833333, PRECISION);
  });

  it("should give a track that starts inside working time a working first stop", () => {
    const stops = getWorkingTimeStops(ALMATY, monday, hours("00:00", "18:00"));
    expect(stops.map((stop) => stop.isWorkingTime)).toEqual([true, false]);
  });

  it("should agree with isWorkingTime a quarter hour on each side of every stop", () => {
    const friday = dayIn(ALMATY, "2026-04-24T06:00:00Z");
    for (const zone of [ALMATY, MOSCOW, NEW_YORK, CAIRO]) {
      const stops = getWorkingTimeStops(zone, friday, hours("09:07", "17:30"));
      const lengthMs = friday.lengthMinutes * 60_000;
      stops.forEach((stop, index) => {
        const at = friday.start.add({
          milliseconds: Math.round(stop.fraction * lengthMs),
        });
        const isBeforeSide = stops[index + 1]?.fraction === stop.fraction;
        const probe = isBeforeSide
          ? at.subtract({ minutes: 15 })
          : at.add({ minutes: 15 });
        expect(isWorkingTime(probe, zone, hours("09:07", "17:30"))).toBe(
          stop.isWorkingTime,
        );
      });
    }
  });

  it("should return the same array on a repeated call and a new one for other hours", () => {
    const first = getWorkingTimeStops(ALMATY, monday, TEN_TO_SIX);
    expect(getWorkingTimeStops(ALMATY, monday, TEN_TO_SIX)).toBe(first);
    expect(
      getWorkingTimeStops(ALMATY, monday, hours("09:00", "18:00")),
    ).not.toBe(first);
  });
});

describe("getWorkingTimeSpans", () => {
  it("should start a span that begins in a skipped hour at the clock change", () => {
    const friday = dayIn(CAIRO, "2026-04-24T06:00:00Z");
    const spans = getWorkingTimeSpans(CAIRO, friday, hours("00:30", "18:00"));
    expect(spans.map((span) => span.start.toString())).toEqual([
      "2026-04-23T22:00:00Z",
    ]);
    expect(spans[0].end.toString()).toBe("2026-04-24T15:00:00Z");
  });

  it("should clip a span to the reference day", () => {
    const monday = dayIn(ALMATY, "2026-03-09T06:00:00Z");
    const spans = getWorkingTimeSpans(ALMATY, monday, hours("00:00", "23:59"));
    expect(spans[0].start.equals(monday.start)).toBe(true);
  });

  it("should give an unknown zone no working time", () => {
    const monday = dayIn(ALMATY, "2026-03-09T06:00:00Z");
    expect(getWorkingTimeSpans("Not/AZone", monday, TEN_TO_SIX)).toEqual([]);
  });

  it("should return the same array on a repeated call", () => {
    const monday = dayIn(ALMATY, "2026-03-09T06:00:00Z");
    expect(getWorkingTimeSpans(MOSCOW, monday, TEN_TO_SIX)).toBe(
      getWorkingTimeSpans(MOSCOW, monday, TEN_TO_SIX),
    );
  });
});

describe("getHourCellWorkingFlags", () => {
  const almatyMonday = dayIn(ALMATY, "2026-03-09T06:00:00Z");
  it.each([
    ["09:07", "18:00", ALMATY, range(9, 17)],
    ["09:40", "18:00", ALMATY, range(10, 17)],
    ["10:00", "18:00", "Asia/Kolkata", range(9, 17)],
    ["10:15", "18:00", "Asia/Kolkata", range(10, 17)],
    ["10:00", "18:00", "Asia/Kathmandu", range(9, 16)],
  ])(
    "should let half of the hour decide for %s-%s in %s",
    (start, end, zone, columns) => {
      expect(
        columnsOf(
          getHourCellWorkingFlags(zone, almatyMonday, hours(start, end)),
        ),
      ).toEqual(columns);
    },
  );

  it("should mark no Moscow cell and only column 0 of New York on a Moscow Saturday", () => {
    const saturday = dayIn(MOSCOW, "2026-03-14T09:00:00Z");
    expect(
      columnsOf(getHourCellWorkingFlags(MOSCOW, saturday, TEN_TO_SIX)),
    ).toEqual([]);
    expect(
      columnsOf(getHourCellWorkingFlags(NEW_YORK, saturday, TEN_TO_SIX)),
    ).toEqual([0]);
  });

  it("should mark the columns 12-19 of Cairo on its clock change day", () => {
    const friday = dayIn(ALMATY, "2026-04-24T06:00:00Z");
    expect(
      columnsOf(getHourCellWorkingFlags(CAIRO, friday, TEN_TO_SIX)),
    ).toEqual(range(12, 19));
  });

  it("should give one flag per cell and the same array on a repeated call", () => {
    const flags = getHourCellWorkingFlags(ALMATY, almatyMonday, TEN_TO_SIX);
    expect(flags).toHaveLength(24);
    expect(getHourCellWorkingFlags(ALMATY, almatyMonday, TEN_TO_SIX)).toBe(
      flags,
    );
  });

  it("should measure the half against the shorter last cell of a day", () => {
    const monday = dayIn(ALMATY, "2026-03-09T06:00:00Z");
    const shortDay = {
      ...monday,
      end: monday.start.add({ minutes: 90 }),
      lengthMinutes: 90,
    };
    const flags = getHourCellWorkingFlags(
      ALMATY,
      shortDay,
      hours("00:00", "01:20"),
    );
    expect(flags).toEqual([true, true]);
  });
});
