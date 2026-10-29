// Verifies FR4 of set-home-location-and-show-differences (D2): the gap note follows the reference zone.
import { describe, expect, it } from "vitest";
import { Temporal } from "@/lib/temporal";
import { followReferenceZone } from "./followReferenceZone";
import {
  INITIAL_WORLD_CLOCK_STATE,
  type Location,
  LocationCommandType,
  reduceLocations,
  type WorldClockState,
} from "./locations";
import {
  ReferenceMode,
  type WallTimeTarget,
  WallTimeTargetKind,
} from "./referenceMoment";
import { WallClockStatus } from "./wallClock";

const almaty: Location = {
  id: "Asia/Almaty|Almaty",
  timeZoneId: "Asia/Almaty",
  label: "Almaty",
  countryCode: "KZ",
};
const NEW_YORK_WALL_TIME = "03:30:00";
const PINNED_INSTANT = "2026-03-08T07:30:00Z";

const pinnedIn = (
  status: WallClockStatus,
  overrides: Partial<WorldClockState> = {},
): WorldClockState => ({
  ...INITIAL_WORLD_CLOCK_STATE,
  deviceTimeZoneId: "America/New_York",
  locations: [almaty],
  reference: {
    mode: ReferenceMode.PINNED,
    instant: Temporal.Instant.from(PINNED_INSTANT),
    wallClockStatus: status,
    requestedWallTime: Temporal.PlainTime.from("02:30"),
  },
  ...overrides,
});
const gapState = (overrides: Partial<WorldClockState> = {}) =>
  pinnedIn(WallClockStatus.GAP, overrides);

const reduceOk = (
  state: WorldClockState,
  command: Parameters<typeof reduceLocations>[1],
) => {
  const outcome = reduceLocations(state, command);
  if (!outcome.ok) throw new Error(outcome.error);
  return outcome.state;
};

function expectGapNoteDropped(state: WorldClockState, wallTime = "12:30:00") {
  if (state.reference.mode !== ReferenceMode.PINNED) throw new Error("live");
  expect(state.reference.instant.toString()).toBe(PINNED_INSTANT);
  expect(state.reference.wallClockStatus).toBe(WallClockStatus.UNIQUE);
  expect(state.reference.requestedWallTime.toString()).toBe(wallTime);
}

describe("followReferenceZone", () => {
  it("should drop the gap note when home is set", () => {
    const state = reduceOk(gapState(), {
      type: LocationCommandType.SET_HOME_LOCATION,
      id: almaty.id,
    });

    expectGapNoteDropped(state);
  });

  it("should drop the gap note when the device zone changes without home", () => {
    const state = reduceOk(gapState(), {
      type: LocationCommandType.SET_DEVICE_TIME_ZONE,
      timeZoneId: "Asia/Almaty",
    });

    expectGapNoteDropped(state);
  });

  it("should drop the gap note when home is removed", () => {
    const state = reduceOk(gapState({ homeLocationId: almaty.id }), {
      type: LocationCommandType.REMOVE_LOCATION,
      id: almaty.id,
    });

    expectGapNoteDropped(state, NEW_YORK_WALL_TIME);
  });

  it("should drop the gap note when a replacement drops home", () => {
    const state = reduceOk(gapState({ homeLocationId: almaty.id }), {
      type: LocationCommandType.REPLACE_LOCATIONS,
      locations: [],
      homeLocationId: null,
    });

    expectGapNoteDropped(state, NEW_YORK_WALL_TIME);
  });

  it.each([
    [
      "a device change while home is set",
      LocationCommandType.SET_DEVICE_TIME_ZONE,
    ],
    ["adding a location", LocationCommandType.ADD_LOCATION],
  ])("should keep the reference object on %s", (_name, type) => {
    const before = gapState({ homeLocationId: almaty.id });
    const command =
      type === LocationCommandType.ADD_LOCATION
        ? { type, timeZoneId: "Asia/Tokyo", label: "Tokyo", countryCode: "JP" }
        : { type, timeZoneId: "Europe/Moscow" };

    const state = reduceOk(before, command as never);

    expect(state.reference).toBe(before.reference);
  });

  it.each([WallClockStatus.UNIQUE, WallClockStatus.AMBIGUOUS])(
    "should keep a pinned %s moment on a zone change",
    (status) => {
      const before = pinnedIn(status);
      const state = reduceOk(before, {
        type: LocationCommandType.SET_HOME_LOCATION,
        id: almaty.id,
      });

      expect(state.reference).toBe(before.reference);
    },
  );

  it("should keep a live moment live", () => {
    const before: WorldClockState = {
      ...INITIAL_WORLD_CLOCK_STATE,
      locations: [almaty],
    };
    const state = reduceOk(before, {
      type: LocationCommandType.SET_HOME_LOCATION,
      id: almaty.id,
    });

    expect(state.reference).toBe(before.reference);
  });

  it("should return the next state itself when nothing follows", () => {
    const next = gapState({ homeLocationId: almaty.id });

    expect(followReferenceZone(next, next)).toBe(next);
  });

  // Verifies FR7 of add-wall-time-input-with-hint (D2).
  describe("a wall-time GAP", () => {
    const withTarget = (
      wallTimeTarget: WallTimeTarget,
      overrides: Partial<WorldClockState> = {},
    ): WorldClockState => {
      const before = gapState(overrides);
      if (before.reference.mode !== ReferenceMode.PINNED)
        throw new Error("live");
      return {
        ...before,
        reference: { ...before.reference, wallTimeTarget },
      };
    };

    it.each([
      [
        "home is set",
        { type: LocationCommandType.SET_HOME_LOCATION, id: almaty.id },
      ],
      [
        "the device zone changes",
        {
          type: LocationCommandType.SET_DEVICE_TIME_ZONE,
          timeZoneId: "Asia/Tokyo",
        },
      ],
    ] as const)("on a location keeps its hint when %s", (_name, command) => {
      const before = withTarget({
        kind: WallTimeTargetKind.LOCATION,
        locationId: almaty.id,
      });

      expect(reduceOk(before, command).reference).toBe(before.reference);
    });

    it("on the Here entry turns into a plain moment when the device zone changes", () => {
      const state = reduceOk(
        withTarget({ kind: WallTimeTargetKind.HERE_ENTRY }),
        {
          type: LocationCommandType.SET_DEVICE_TIME_ZONE,
          timeZoneId: "Asia/Tokyo",
        },
      );

      expectGapNoteDropped(state, "16:30:00");
      expect(
        state.reference.mode === ReferenceMode.PINNED &&
          state.reference.wallTimeTarget,
      ).toBeUndefined();
    });

    it("on the Here entry keeps its hint when home is set", () => {
      const before = withTarget({ kind: WallTimeTargetKind.HERE_ENTRY });

      expect(
        reduceOk(before, {
          type: LocationCommandType.SET_HOME_LOCATION,
          id: almaty.id,
        }).reference,
      ).toBe(before.reference);
    });
  });
});
