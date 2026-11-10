// Verifies FR1, FR3, FR5, FR8, FR10, FR12 of add-grid-meeting-range-and-share.
import { describe, expect, it } from "vitest";
import { Temporal } from "@/lib/temporal";
import { buildReferenceDay } from "@/test/referenceDay";
import { TrackMove } from "./dayTrack";
import {
  getLocationMeetingRange,
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
const at = (time: string) => Temporal.Instant.from(`2026-03-08T${time}:00Z`);
const SAMPLE: MeetingRange = { start: at("04:00"), end: at("06:00") };
const show = (range: MeetingRange) =>
  `${range.start.toString()}/${range.end.toString()}`;

describe("isValidMeetingRange", () => {
  it("should accept the sample meeting", () => {
    expect(isValidMeetingRange(day, SAMPLE.start, SAMPLE.end)).toBe(true);
  });

  it("should accept the whole reference day", () => {
    expect(isValidMeetingRange(day, day.start, day.end)).toBe(true);
  });

  it.each([
    ["end before start", "06:00", "04:00"],
    ["equal ends", "04:00", "04:00"],
    ["start off the step", "04:10", "06:00"],
    ["end off the step", "04:00", "06:10"],
    ["end after the day's end", "17:00", "19:15"],
    ["start before the day", "18:45", "20:00"],
  ])("should refuse %s", (_name, start, end) => {
    const startInstant = at(start);
    const endInstant = at(end);
    expect(isValidMeetingRange(day, startInstant, endInstant)).toBe(false);
  });
});

describe("getMeetingRangeOfCells", () => {
  it.each([
    [9, 9, "04:00", "05:00"],
    [9, 10, "04:00", "06:00"],
    [10, 8, "03:00", "06:00"],
  ])("should span columns %i to %i", (first, last, start, end) => {
    const range = getMeetingRangeOfCells(day, first, last);
    expect(show(range)).toBe(show({ start: at(start), end: at(end) }));
  });

  it("should end the last short cell at the day's end", () => {
    const lordHoweDay = buildReferenceDay(
      Temporal.Instant.from("2026-04-04T14:00:00Z"),
      "Australia/Lord_Howe",
    );
    const lastColumn = Math.ceil(lordHoweDay.lengthMinutes / 60) - 1;

    const range = getMeetingRangeOfCells(lordHoweDay, lastColumn, lastColumn);

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
    [MeetingHandle.END, TrackMove.DAY_END, "04:00", "-"],
  ])("should move %s by %s", (handle, move, start, end) => {
    const range = getMeetingRangeAfterHandleMove(day, SAMPLE, handle, move);
    expect(range.start.equals(start === "-" ? day.start : at(start))).toBe(
      true,
    );
    expect(range.end.equals(end === "-" ? day.end : at(end))).toBe(true);
  });
});

describe("getMeetingRangeAtHandleMinutes", () => {
  it.each([
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
      maxMinutes: 1440,
    });
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
    const nextDay = buildReferenceDay(at("04:00").add({ hours: 24 }), ALMATY);
    const range = moveMeetingRangeToDay(
      SAMPLE,
      SAMPLE.start.add({ hours: 24 }),
      nextDay,
    );
    expect(range.end.since(range.start).total({ unit: "hour" })).toBe(2);
  });

  it("should clamp the end to a 23-hour day", () => {
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
      second,
    );
    expect(range.end.equals(second.end)).toBe(true);
  });
});

describe("getLocationMeetingRange", () => {
  it("should read the local span and day shift of New York", () => {
    const local = getLocationMeetingRange("America/New_York", SAMPLE, ALMATY);
    expect(local.localStart.toPlainTime().toString()).toBe("23:00:00");
    expect(local.localEnd.toPlainTime().toString()).toBe("01:00:00");
    expect(local.dayShift).toBe("EARLIER");
  });
});
