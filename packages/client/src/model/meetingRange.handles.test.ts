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
  getMeetingSpan,
  type MeetingEndHandle,
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
        handle as MeetingEndHandle,
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
    const range = getMeetingRangeAtHandleMinutes(
      day,
      SAMPLE,
      handle as MeetingEndHandle,
      minutes,
    );
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
