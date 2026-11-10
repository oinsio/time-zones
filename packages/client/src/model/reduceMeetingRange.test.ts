// Verifies FR1, FR2, FR3, FR4 of add-grid-meeting-range-and-share.
import { describe, expect, it } from "vitest";
import { LocationKind } from "./locationKind";
import {
  INITIAL_WORLD_CLOCK_STATE,
  type Location,
  type LocationCommand,
  LocationCommandType,
  LocationErrorCode,
  reduceLocations,
  type WorldClockState,
} from "./locations";
import { ReferenceMode, WallTimeTargetKind } from "./referenceMoment";
import { WallClockStatus } from "./wallClock";

const city = (timeZoneId: string, label: string): Location => ({
  id: `${timeZoneId}|${label}`,
  kind: LocationKind.CITY,
  timeZoneId,
  label,
  countryCode: "XX",
});
const almaty = city("Asia/Almaty", "Almaty");
const moscow = city("Europe/Moscow", "Moscow");
const NOW = "2026-03-08T07:30:00Z";
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

describe("SET_MEETING_RANGE", () => {
  it("should set the range", () => {
    expect(show(meetingState)).toBe(
      "2026-03-08T04:00:00Z/2026-03-08T06:00:00Z",
    );
  });

  it("should pin the reference moment at the start with a unique status", () => {
    const { reference } = meetingState;
    if (reference.mode !== ReferenceMode.PINNED) throw new Error("not pinned");
    expect(reference.instant.toString()).toBe("2026-03-08T04:00:00Z");
    expect(reference.wallClockStatus).toBe(WallClockStatus.UNIQUE);
    expect(reference.requestedWallTime.toString()).toBe("09:00:00");
  });

  it("should return the same state for the same range", () => {
    expect(reduceOk(meetingState, SAMPLE)).toBe(meetingState);
  });

  it.each([
    ["a gap status", { wallClockStatus: WallClockStatus.GAP }],
    [
      "a wall time target",
      {
        wallTimeTarget: {
          kind: WallTimeTargetKind.LOCATION,
          locationId: almaty.id,
        },
      },
    ],
  ] as const)(
    "should repin the same range when the reference has %s",
    (_name, extra) => {
      const { reference } = meetingState;
      if (reference.mode !== ReferenceMode.PINNED)
        throw new Error("not pinned");
      const stale: WorldClockState = {
        ...meetingState,
        reference: { ...reference, ...extra },
      };
      const next = reduceOk(stale, SAMPLE);
      expect(next).not.toBe(stale);
      expect(next.reference).toEqual(reference);
    },
  );

  it("should repin the same range when the reference is live", () => {
    const live = { ...meetingState, reference: baseState.reference };
    const next = reduceOk(live, SAMPLE);
    expect(next.reference).toEqual(meetingState.reference);
  });

  it("should replace a previous range", () => {
    const replaced = reduceOk(
      meetingState,
      setRange("2026-03-08T05:00:00Z", "2026-03-08T05:15:00Z"),
    );
    expect(show(replaced)).toBe("2026-03-08T05:00:00Z/2026-03-08T05:15:00Z");
  });

  it.each([
    ["2026-03-08T06:00:00Z", "2026-03-08T04:00:00Z"],
    ["2026-03-08T04:00:00Z", "2026-03-08T04:00:00Z"],
    ["2026-03-08 04:00", "2026-03-08T06:00:00Z"],
    ["2026-13-45T04:00:00Z", "2026-03-08T06:00:00Z"],
    ["2026-03-08T04:00:00Z", "not an instant Z"],
    ["2026-03-08T17:00:00Z", "2026-03-08T19:15:00Z"],
    ["2026-03-08 04:00", "2026-03-08T06:00:00Z"],
  ])("should refuse %s to %s", (start, end) => {
    expect(reduceLocations(baseState, setRange(start, end))).toEqual({
      ok: false,
      error: LocationErrorCode.INVALID_MEETING_RANGE,
    });
  });
});

describe("CLEAR_MEETING_RANGE", () => {
  const clear: LocationCommand = {
    type: LocationCommandType.CLEAR_MEETING_RANGE,
  };

  it("should remove the range and keep the moment pinned", () => {
    const cleared = reduceOk(meetingState, clear);
    expect(cleared.meeting).toBeUndefined();
    expect(cleared.reference).toBe(meetingState.reference);
  });

  it("should return the same state when no range is set", () => {
    expect(reduceOk(baseState, clear)).toBe(baseState);
  });
});

describe("commands that remove the range", () => {
  it.each([
    ["RESET_TO_NOW", { type: LocationCommandType.RESET_TO_NOW }],
    [
      "SELECT_INSTANT",
      {
        type: LocationCommandType.SELECT_INSTANT,
        instant: "2026-03-08T08:00:00Z",
      },
    ],
    [
      "SELECT_INSTANT of the start",
      {
        type: LocationCommandType.SELECT_INSTANT,
        instant: "2026-03-08T04:00:00Z",
      },
    ],
    [
      "SET_WALL_TIME",
      {
        type: LocationCommandType.SET_WALL_TIME,
        target: { kind: "LOCATION", locationId: almaty.id },
        time: "12:15",
        date: "2026-03-08",
      },
    ],
  ] as [string, LocationCommand][])(
    "should remove it on %s",
    (_name, command) => {
      expect(reduceOk(meetingState, command).meeting).toBeUndefined();
    },
  );
});

describe("date change", () => {
  it("should keep 09:00-11:00 on the next day", () => {
    const next = reduceOk(meetingState, {
      type: LocationCommandType.SHIFT_DATE,
      days: 1,
      now: NOW,
    });
    expect(show(next)).toBe("2026-03-09T04:00:00Z/2026-03-09T06:00:00Z");
  });

  it("should clamp the end of a whole day to the shorter next day", () => {
    const newYork = city("America/New_York", "New York");
    const state: WorldClockState = {
      ...baseState,
      locations: [newYork],
      homeLocationId: newYork.id,
    };
    const wholeDay = reduceOk(
      state,
      setRange("2026-03-07T05:00:00Z", "2026-03-08T05:00:00Z"),
    );

    const next = reduceOk(wholeDay, {
      type: LocationCommandType.SHIFT_DATE,
      days: 1,
      now: NOW,
    });

    expect(show(next)).toBe("2026-03-08T05:00:00Z/2026-03-09T04:00:00Z");
  });

  it("should move it with SET_DATE", () => {
    const moved = reduceOk(meetingState, {
      type: LocationCommandType.SET_DATE,
      date: "2026-03-20",
      now: NOW,
    });
    expect(show(moved)).toBe("2026-03-20T04:00:00Z/2026-03-20T06:00:00Z");
  });
});

describe("reference zone change", () => {
  const tokyoDeviceState = reduceOk(
    { ...baseState, deviceTimeZoneId: "Asia/Tokyo" },
    SAMPLE,
  );
  const noHomeState = reduceOk({ ...baseState, homeLocationId: null }, SAMPLE);
  it.each([
    [
      "another home",
      meetingState,
      { type: LocationCommandType.SET_HOME_LOCATION, id: moscow.id },
    ],
    [
      "a cleared home",
      tokyoDeviceState,
      { type: LocationCommandType.SET_HOME_LOCATION, id: null },
    ],
    [
      "another device zone without home",
      noHomeState,
      {
        type: LocationCommandType.SET_DEVICE_TIME_ZONE,
        timeZoneId: "Asia/Tokyo",
      },
    ],
    [
      "a list with another home",
      meetingState,
      {
        type: LocationCommandType.REPLACE_LOCATIONS,
        locations: [almaty, moscow],
        homeLocationId: moscow.id,
      },
    ],
  ] as [string, WorldClockState, LocationCommand][])(
    "should remove it on %s",
    (_name, state, command) => {
      const next = reduceOk(state, command);
      expect(next.meeting).toBeUndefined();
      expect(next.reference.mode).toBe(ReferenceMode.PINNED);
    },
  );

  it("should remove it when the last location is removed", () => {
    const single = reduceOk({ ...baseState, locations: [almaty] }, SAMPLE);
    const emptied = reduceOk(single, {
      type: LocationCommandType.REMOVE_LOCATION,
      id: almaty.id,
    });
    expect(emptied.meeting).toBeUndefined();
  });

  it("should keep it when a location is added", () => {
    const added = reduceOk(meetingState, {
      type: LocationCommandType.ADD_LOCATION,
      timeZoneId: "Asia/Tokyo",
      label: "Tokyo",
      countryCode: "JP",
    });
    expect(show(added)).toBe(show(meetingState));
  });
});
