// Verifies FR14, FR20 of move-meeting-range-and-extend-past-midnight.
import { describe, expect, it } from "vitest";
import { Temporal } from "@/lib/temporal";
import { buildReferenceDay } from "@/test/referenceDay";
import { TrackMove } from "./dayTrack";
import type { MeetingRange } from "./meetingRange";
import {
  getMeetingRangeAfterMove,
  getMeetingRangeAtStartMinutes,
} from "./meetingRangeMove";

const ALMATY = "Asia/Almaty";
const day = buildReferenceDay(
  Temporal.Instant.from("2026-03-08T07:30:00Z"),
  ALMATY,
);
const MINUTES_OF_DAY_START_TO_SAMPLE = 540;
/** A range from `startMinutes` to `endMinutes` after the start of the sample day. */
const rangeOf = (startMinutes: number, endMinutes: number): MeetingRange => ({
  start: day.start.add({ minutes: startMinutes }),
  end: day.start.add({ minutes: endMinutes }),
});
const minutesOf = (instant: Temporal.Instant) =>
  instant.since(day.start).total({ unit: "minute" });
const spanOf = (range: MeetingRange) => [
  minutesOf(range.start),
  minutesOf(range.end),
];
const SAMPLE = rangeOf(MINUTES_OF_DAY_START_TO_SAMPLE, 660);

describe("getMeetingRangeAfterMove", () => {
  it.each([
    ["next step", TrackMove.NEXT_STEP, SAMPLE, [555, 675]],
    ["previous step", TrackMove.PREVIOUS_STEP, SAMPLE, [525, 645]],
    ["an hour forward", TrackMove.HOUR_FORWARD, SAMPLE, [600, 720]],
    ["an hour back", TrackMove.HOUR_BACK, SAMPLE, [480, 600]],
    ["earliest", TrackMove.DAY_START, SAMPLE, [0, 120]],
    ["latest", TrackMove.DAY_END, SAMPLE, [1425, 1545]],
    // a meeting off the track step
    [
      "next step off the step",
      TrackMove.NEXT_STEP,
      rangeOf(545, 568),
      [555, 578],
    ],
    [
      "previous step off the step",
      TrackMove.PREVIOUS_STEP,
      rangeOf(545, 568),
      [540, 563],
    ],
    [
      "an hour back off the step",
      TrackMove.HOUR_BACK,
      rangeOf(545, 568),
      [485, 508],
    ],
    // the limits
    [
      "previous step at the start",
      TrackMove.PREVIOUS_STEP,
      rangeOf(0, 120),
      [0, 120],
    ],
    [
      "an hour back near the start",
      TrackMove.HOUR_BACK,
      rangeOf(30, 150),
      [0, 120],
    ],
    [
      "next step at the latest",
      TrackMove.NEXT_STEP,
      rangeOf(1425, 1545),
      [1425, 1545],
    ],
    [
      "an hour forward near the latest",
      TrackMove.HOUR_FORWARD,
      rangeOf(1400, 1430),
      [1425, 1455],
    ],
  ])("should move %s", (_name, move, before, expected) => {
    expect(spanOf(getMeetingRangeAfterMove(before, day, move))).toEqual(
      expected,
    );
  });

  it("should keep the length of the range in every move", () => {
    const moved = getMeetingRangeAfterMove(SAMPLE, day, TrackMove.DAY_END);

    expect(minutesOf(moved.end) - minutesOf(moved.start)).toBe(120);
  });

  it("should keep the length in absolute minutes on a clock change day", () => {
    const newYorkDay = buildReferenceDay(
      Temporal.Instant.from("2026-03-08T12:00:00Z"),
      "America/New_York",
    );
    const before = {
      start: newYorkDay.start.add({ minutes: 30 }),
      end: newYorkDay.start.add({ minutes: 90 }),
    };

    const twice = getMeetingRangeAfterMove(
      getMeetingRangeAfterMove(before, newYorkDay, TrackMove.HOUR_FORWARD),
      newYorkDay,
      TrackMove.HOUR_FORWARD,
    );

    expect(twice.end.since(twice.start).total({ unit: "minute" })).toBe(60);
    expect(twice.start.since(before.start).total({ unit: "minute" })).toBe(120);
  });
});

describe("getMeetingRangeAtStartMinutes", () => {
  it.each([
    ["14:37 lands on 14:30", rangeOf(780, 900), 877, [870, 990]],
    ["14:38 lands on 14:45", rangeOf(780, 900), 878, [885, 1005]],
    ["23:58 stops at the latest", rangeOf(780, 900), 1438, [1425, 1545]],
    [
      "an hour before the day starts stops at the start",
      rangeOf(780, 900),
      -60,
      [0, 120],
    ],
  ])("should put the start so that %s", (_name, before, minutes, expected) => {
    expect(spanOf(getMeetingRangeAtStartMinutes(before, day, minutes))).toEqual(
      expected,
    );
  });
});
