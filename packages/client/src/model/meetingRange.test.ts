// Verifies FR1, FR4, FR5 of refine-meeting-range-entry-and-handles.
// Verifies FR1, FR3, FR5, FR8, FR10, FR12 of add-grid-meeting-range-and-share.
import { describe, expect, it } from "vitest";
import { Temporal } from "@/lib/temporal";
import { buildReferenceDay } from "@/test/referenceDay";
import { TrackMove } from "./dayTrack";
import {
  getMeetingHandleLimits,
  getMeetingRangeAfterHandleMove,
  getMeetingRangeAtHandleMinutes,
  getMeetingRangeOfCells,
  getMeetingSpan,
  isValidMeetingRange,
  MeetingHandle,
  type MeetingRange,
  moveMeetingRangeToDay,
} from "./meetingRange";

const ALMATY = "Asia/Almaty";
const day = buildReferenceDay(
  Temporal.Instant.from("2026-03-08T07:30:00Z"),
  ALMATY,
);
const at = (time: string) =>
  Temporal.Instant.from(
    `2026-03-08T${time.length === "HH:MM".length ? `${time}:00` : time}Z`,
  );
const SAMPLE: MeetingRange = { start: at("04:00"), end: at("06:00") };
const show = (range: MeetingRange) =>
  `${range.start.toString()}/${range.end.toString()}`;

describe("isValidMeetingRange", () => {
  it("should accept the sample meeting", () => {
    expect(isValidMeetingRange(day, SAMPLE.start, SAMPLE.end)).toBe(true);
  });

  it.each([
    ["five minutes", "04:05", "04:10"],
    ["one minute", "04:00", "04:01"],
  ])("should accept a range of %s", (_name, start, end) => {
    expect(isValidMeetingRange(day, at(start), at(end))).toBe(true);
  });

  it("should accept the whole reference day", () => {
    expect(isValidMeetingRange(day, day.start, day.end)).toBe(true);
  });

  it.each([
    ["end before start", "06:00", "04:00"],
    ["equal ends", "04:00", "04:00"],
    ["start off a whole minute", "04:10:30", "06:00"],
    ["end off a whole minute", "04:00", "06:10:30"],
    ["start after the day's end", "19:00", "20:00"],
  ])("should refuse %s", (_name, start, end) => {
    const startInstant = at(start);
    const endInstant = at(end);
    expect(isValidMeetingRange(day, startInstant, endInstant)).toBe(false);
  });

  it("should refuse a start before the day", () => {
    expect(
      isValidMeetingRange(
        day,
        day.start.subtract({ minutes: 15 }),
        day.start.add({ hours: 1 }),
      ),
    ).toBe(false);
  });

  // FR1, FR2: a range past midnight of the reference zone
  it.each([
    ["past midnight", "18:00", "21:00"],
    ["to a quarter past midnight", "17:00", "19:15"],
  ])("should accept a range %s", (_name, start, end) => {
    expect(isValidMeetingRange(day, at(start), at(end))).toBe(true);
  });

  it("should accept a range of exactly 24 hours", () => {
    expect(
      isValidMeetingRange(day, at("04:00"), at("04:00").add({ hours: 24 })),
    ).toBe(true);
  });

  it("should refuse a range of 24 hours and one minute", () => {
    expect(
      isValidMeetingRange(
        day,
        at("04:00"),
        at("04:00").add({ hours: 24, minutes: 1 }),
      ),
    ).toBe(false);
  });
});

describe("getMeetingRangeOfCells", () => {
  it.each([
    [9, 9, "04:00", "05:00"],
    [9, 10, "04:00", "06:00"],
    [10, 8, "03:00", "06:00"],
  ])("should span columns %i to %i", (first, last, start, end) => {
    const range = getMeetingRangeOfCells(day, ALMATY, first, last);
    expect(show(range)).toBe(show({ start: at(start), end: at(end) }));
  });

  // FR9: cell drags onto the strip tail
  it.each([
    [21, 24, "2026-03-08T16:00:00Z", "2026-03-08T20:00:00Z"],
    [24, 21, "2026-03-08T16:00:00Z", "2026-03-08T20:00:00Z"],
    [23, 26, "2026-03-08T18:00:00Z", "2026-03-08T22:00:00Z"],
    [0, 26, "2026-03-07T19:00:00Z", "2026-03-08T19:00:00Z"],
  ])(
    "should span columns %i to %i onto the tail",
    (first, last, start, end) => {
      const range = getMeetingRangeOfCells(day, ALMATY, first, last);
      expect(show(range)).toBe(`${start}/${end}`);
    },
  );

  it("should start the first tail column of a 24.5-hour day at the day's end", () => {
    const lordHoweDay = buildReferenceDay(
      Temporal.Instant.from("2026-04-04T14:00:00Z"),
      "Australia/Lord_Howe",
    );
    const tailColumn = Math.ceil(lordHoweDay.lengthMinutes / 60);

    const range = getMeetingRangeOfCells(
      lordHoweDay,
      "Australia/Lord_Howe",
      tailColumn - 1,
      tailColumn,
    );

    expect(range.end.since(lordHoweDay.end).total({ unit: "minute" })).toBe(60);
  });

  it("should end the last short cell at the day's end", () => {
    const lordHoweDay = buildReferenceDay(
      Temporal.Instant.from("2026-04-04T14:00:00Z"),
      "Australia/Lord_Howe",
    );
    const lastColumn = Math.ceil(lordHoweDay.lengthMinutes / 60) - 1;

    const range = getMeetingRangeOfCells(
      lordHoweDay,
      "Australia/Lord_Howe",
      lastColumn,
      lastColumn,
    );

    expect(range.end.equals(lordHoweDay.end)).toBe(true);
    expect(range.end.since(range.start).total({ unit: "minute" })).toBe(
      lordHoweDay.lengthMinutes % 60 || 60,
    );
  });
});

describe("getMeetingRangeAfterHandleMove", () => {
  it.each([
    [MeetingHandle.START, TrackMove.NEXT_STEP, "04:15", "06:00"],
    [MeetingHandle.START, TrackMove.PREVIOUS_STEP, "03:45", "06:00"],
    [MeetingHandle.START, TrackMove.HOUR_BACK, "03:00", "06:00"],
    [MeetingHandle.START, TrackMove.DAY_END, "05:45", "06:00"],
    [MeetingHandle.START, TrackMove.DAY_START, "-", "06:00"],
    [MeetingHandle.END, TrackMove.DAY_START, "04:00", "04:15"],
    [MeetingHandle.END, TrackMove.HOUR_FORWARD, "04:00", "07:00"],
    [MeetingHandle.END, TrackMove.DAY_END, "04:00", "04:00+24h"],
  ])("should move %s by %s", (handle, move, start, end) => {
    const range = getMeetingRangeAfterHandleMove(day, SAMPLE, handle, move);
    expect(range.start.equals(start === "-" ? day.start : at(start))).toBe(
      true,
    );
    const expectedEnd = end.endsWith("+24h")
      ? at(end.slice(0, "HH:MM".length)).add({ hours: 24 })
      : at(end);
    expect(range.end.equals(end === "-" ? day.end : expectedEnd)).toBe(true);
  });
});

// FR4: the handles of a meeting past midnight (23:00–02:00 in Almaty)
describe("getMeetingRangeAfterHandleMove of a meeting past midnight", () => {
  const PAST_MIDNIGHT: MeetingRange = { start: at("18:00"), end: at("21:00") };
  const minutesOf = (instant: Temporal.Instant) =>
    instant.since(day.start).total({ unit: "minute" });

  it.each([
    [MeetingHandle.END, TrackMove.NEXT_STEP, 1380, 1575],
    [MeetingHandle.END, TrackMove.HOUR_BACK, 1380, 1500],
    [MeetingHandle.END, TrackMove.DAY_START, 1380, 1395],
    [MeetingHandle.END, TrackMove.DAY_END, 1380, 2820],
    [MeetingHandle.START, TrackMove.NEXT_STEP, 1395, 1560],
    [MeetingHandle.START, TrackMove.DAY_END, 1425, 1560],
    [MeetingHandle.START, TrackMove.DAY_START, 120, 1560],
  ])("should move %s by %s", (handle, move, startMinutes, endMinutes) => {
    const range = getMeetingRangeAfterHandleMove(
      day,
      PAST_MIDNIGHT,
      handle,
      move,
    );
    expect([minutesOf(range.start), minutesOf(range.end)]).toEqual([
      startMinutes,
      endMinutes,
    ]);
  });

  it("should land a dragged end past midnight on the track step", () => {
    const range = getMeetingRangeAtHandleMinutes(
      day,
      { start: at("17:00"), end: at("18:00") },
      MeetingHandle.END,
      1480,
    );
    expect(minutesOf(range.end)).toBe(1485);
  });
});

describe("getMeetingRangeAfterHandleMove from an end off the track step", () => {
  it.each([
    [
      "09:05",
      "11:00",
      MeetingHandle.START,
      TrackMove.NEXT_STEP,
      "09:15",
      "11:00",
    ],
    [
      "09:05",
      "11:00",
      MeetingHandle.START,
      TrackMove.PREVIOUS_STEP,
      "09:00",
      "11:00",
    ],
    [
      "09:05",
      "11:00",
      MeetingHandle.START,
      TrackMove.HOUR_BACK,
      "08:05",
      "11:00",
    ],
    [
      "09:00",
      "10:50",
      MeetingHandle.END,
      TrackMove.PREVIOUS_STEP,
      "09:00",
      "10:45",
    ],
    [
      "09:00",
      "09:05",
      MeetingHandle.END,
      TrackMove.DAY_START,
      "09:00",
      "09:05",
    ],
    [
      "09:00",
      "09:05",
      MeetingHandle.START,
      TrackMove.NEXT_STEP,
      "09:00",
      "09:05",
    ],
    [
      "09:00",
      "09:05",
      MeetingHandle.END,
      TrackMove.NEXT_STEP,
      "09:00",
      "09:15",
    ],
    [
      "09:05",
      "09:28",
      MeetingHandle.START,
      TrackMove.NEXT_STEP,
      "09:13",
      "09:28",
    ],
  ])(
    "should move %s-%s %s by %s to %s-%s",
    (rangeStart, rangeEnd, handle, move, start, end) => {
      const almatyAt = (time: string) => at(time).subtract({ hours: 5 });
      const range = getMeetingRangeAfterHandleMove(
        day,
        { start: almatyAt(rangeStart), end: almatyAt(rangeEnd) },
        handle,
        move,
      );
      expect(show(range)).toBe(
        show({ start: almatyAt(start), end: almatyAt(end) }),
      );
    },
  );
});

describe("getMeetingRangeAtHandleMinutes", () => {
  it.each([
    [MeetingHandle.START, 551, "04:15", "06:00"],
    [MeetingHandle.END, 460, "04:00", "04:15"],
    [MeetingHandle.START, 780, "05:45", "06:00"],
    [MeetingHandle.START, 547, "04:00", "06:00"],
    [MeetingHandle.START, 548, "04:15", "06:00"],
  ])("should put %s at %i minutes", (handle, minutes, start, end) => {
    const range = getMeetingRangeAtHandleMinutes(day, SAMPLE, handle, minutes);
    expect(show(range)).toBe(show({ start: at(start), end: at(end) }));
  });
});

describe("getMeetingHandleLimits", () => {
  it("should limit the start handle", () => {
    expect(getMeetingHandleLimits(day, SAMPLE, MeetingHandle.START)).toEqual({
      minMinutes: 0,
      maxMinutes: 645,
    });
  });

  it("should limit the end handle", () => {
    expect(getMeetingHandleLimits(day, SAMPLE, MeetingHandle.END)).toEqual({
      minMinutes: 555,
      maxMinutes: 1980,
    });
  });

  // FR4: the limits of a meeting past midnight
  it("should limit the handles of a meeting past midnight", () => {
    const pastMidnight = { start: at("18:00"), end: at("21:00") };
    expect([
      getMeetingHandleLimits(day, pastMidnight, MeetingHandle.START),
      getMeetingHandleLimits(day, pastMidnight, MeetingHandle.END),
    ]).toEqual([
      { minMinutes: 120, maxMinutes: 1425 },
      { minMinutes: 1395, maxMinutes: 2820 },
    ]);
  });
});

describe("getMeetingHandleLimits of a range shorter than one step", () => {
  const SHORT: MeetingRange = { start: at("04:00"), end: at("04:05") };

  it("should keep the start handle limit at the start", () => {
    expect(
      getMeetingHandleLimits(day, SHORT, MeetingHandle.START).maxMinutes,
    ).toBe(540);
  });

  it("should keep the end handle limit at the end", () => {
    expect(
      getMeetingHandleLimits(day, SHORT, MeetingHandle.END).minMinutes,
    ).toBe(545);
  });
});

describe("getMeetingSpan", () => {
  it("should read minutes and columns of the sample", () => {
    expect(getMeetingSpan(day, SAMPLE)).toEqual({
      startMinutes: 540,
      endMinutes: 660,
      firstColumn: 9,
      lastColumn: 10,
    });
  });

  it("should cover the columns a quarter-hour range overlaps", () => {
    const range = { start: at("04:15"), end: at("05:30") };
    expect(getMeetingSpan(day, range)).toMatchObject({
      firstColumn: 9,
      lastColumn: 10,
    });
  });
});

describe("moveMeetingRangeToDay", () => {
  it("should keep the duration on the next day", () => {
    const range = moveMeetingRangeToDay(
      SAMPLE,
      SAMPLE.start.add({ hours: 24 }),
    );
    expect(range.end.since(range.start).total({ unit: "hour" })).toBe(2);
  });

  it("should keep an off-step start on the next day", () => {
    const range = moveMeetingRangeToDay(
      { start: at("04:05"), end: at("04:28") },
      at("04:05").add({ hours: 24 }),
    );
    expect(show(range)).toBe(
      show({
        start: at("04:05").add({ hours: 24 }),
        end: at("04:28").add({ hours: 24 }),
      }),
    );
  });

  it("should keep the length on a 23-hour day", () => {
    const newYork = "America/New_York";
    const first = buildReferenceDay(
      Temporal.Instant.from("2026-03-07T12:00:00Z"),
      newYork,
    );
    const second = buildReferenceDay(
      Temporal.Instant.from("2026-03-08T12:00:00Z"),
      newYork,
    );
    const range = moveMeetingRangeToDay(
      { start: first.start, end: first.end },
      second.start,
    );
    expect(range.end.since(range.start).total({ unit: "hour" })).toBe(24);
  });
});
