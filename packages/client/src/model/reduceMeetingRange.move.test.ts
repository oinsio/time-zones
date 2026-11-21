// Verifies FR1, FR2, FR3, FR4 of add-grid-meeting-range-and-share.
// Verifies FR1, FR2, FR14, FR20 of move-meeting-range-and-extend-past-midnight.
import { describe, expect, it } from "vitest";
import { TrackMove } from "./dayTrack";
import { LocationKind } from "./locationKind";
import {
  INITIAL_WORLD_CLOCK_STATE,
  type Location,
  type LocationCommand,
  LocationCommandType,
  reduceLocations,
  type WorldClockState,
} from "./locations";
import type { MeetingRangeMove } from "./meetingRangeMove";
import { ReferenceMode } from "./referenceMoment";

const city = (timeZoneId: string, label: string): Location => ({
  id: `${timeZoneId}|${label}`,
  kind: LocationKind.CITY,
  timeZoneId,
  label,
  countryCode: "XX",
});
const almaty = city("Asia/Almaty", "Almaty");
const moscow = city("Europe/Moscow", "Moscow");
const baseState: WorldClockState = {
  ...INITIAL_WORLD_CLOCK_STATE,
  deviceTimeZoneId: "Asia/Almaty",
  locations: [almaty, moscow],
  homeLocationId: almaty.id,
};

const reduceOk = (state: WorldClockState, command: LocationCommand) => {
  const outcome = reduceLocations(state, command);
  if (!outcome.ok) throw new Error(`unexpected error ${outcome.error}`);
  return outcome.state;
};
const setRange = (start: string, end: string): LocationCommand => ({
  type: LocationCommandType.SET_MEETING_RANGE,
  start,
  end,
});
const SAMPLE = setRange("2026-03-08T04:00:00Z", "2026-03-08T06:00:00Z");
const meetingState = reduceOk(baseState, SAMPLE);
const show = (state: WorldClockState) =>
  `${state.meeting?.start.toString()}/${state.meeting?.end.toString()}`;

// Verifies FR14, FR20 of move-meeting-range-and-extend-past-midnight (D3).
describe("MOVE_MEETING_RANGE", () => {
  const move = (target: MeetingRangeMove): LocationCommand => ({
    type: LocationCommandType.MOVE_MEETING_RANGE,
    target,
  });

  it("should shift start and end by the same step", () => {
    const moved = reduceOk(meetingState, move({ move: TrackMove.NEXT_STEP }));

    expect(show(moved)).toBe("2026-03-08T04:15:00Z/2026-03-08T06:15:00Z");
  });

  it("should pin the reference moment at the new start", () => {
    const moved = reduceOk(
      meetingState,
      move({ move: TrackMove.HOUR_FORWARD }),
    );

    expect(moved.reference).toMatchObject({
      mode: ReferenceMode.PINNED,
      instant: moved.meeting?.start,
    });
  });

  it("should put the start on the track step nearest a pointer position", () => {
    const moved = reduceOk(meetingState, move({ startMinutes: 878 }));

    expect(show(moved)).toBe("2026-03-08T09:45:00Z/2026-03-08T11:45:00Z");
  });

  it("should end a range moved to the latest start after midnight", () => {
    const moved = reduceOk(meetingState, move({ move: TrackMove.DAY_END }));

    expect(show(moved)).toBe("2026-03-08T18:45:00Z/2026-03-08T20:45:00Z");
  });

  it("should leave the state as it is when no range is set", () => {
    expect(reduceOk(baseState, move({ move: TrackMove.NEXT_STEP }))).toBe(
      baseState,
    );
  });

  it("should return the same state when the start is already at the limit", () => {
    const atLatest = reduceOk(meetingState, move({ move: TrackMove.DAY_END }));

    expect(reduceOk(atLatest, move({ move: TrackMove.NEXT_STEP }))).toBe(
      atLatest,
    );
  });
});

describe("SET_MEETING_RANGE past midnight", () => {
  // FR1, FR2: the end may lie in the next reference day
  it("should set a meeting that ends after midnight", () => {
    const state = reduceOk(
      baseState,
      setRange("2026-03-08T18:00:00Z", "2026-03-08T21:00:00Z"),
    );
    expect(show(state)).toBe("2026-03-08T18:00:00Z/2026-03-08T21:00:00Z");
  });
});
