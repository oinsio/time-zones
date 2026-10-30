// Verifies FR7, FR9 of add-wall-time-input-with-hint (D2).
import { describe, expect, it } from "vitest";
import { Temporal } from "@/lib/temporal";
import {
  INITIAL_WORLD_CLOCK_STATE,
  type Location,
  type WorldClockState,
} from "./locations";
import {
  ReferenceMode,
  type WallTimeTarget,
  WallTimeTargetKind,
} from "./referenceMoment";
import { WallClockStatus } from "./wallClock";
import { getWallClockNote, WallClockNotePlacement } from "./wallClockNote";

const newYork: Location = {
  id: "America/New_York|New York",
  timeZoneId: "America/New_York",
  label: "New York",
  countryCode: "US",
};
const almaty: Location = {
  id: "Asia/Almaty|Almaty",
  timeZoneId: "Asia/Almaty",
  label: "Almaty",
  countryCode: "KZ",
};
const requestedWallTime = Temporal.PlainTime.from("02:30");
const newYorkTarget: WallTimeTarget = {
  kind: WallTimeTargetKind.LOCATION,
  locationId: newYork.id,
};
const hereTarget: WallTimeTarget = { kind: WallTimeTargetKind.HERE_ENTRY };

const pinned = (
  status: WallClockStatus,
  wallTimeTarget?: WallTimeTarget,
  locations: Location[] = [newYork],
): WorldClockState => ({
  ...INITIAL_WORLD_CLOCK_STATE,
  deviceTimeZoneId: "Asia/Almaty",
  locations,
  reference: {
    mode: ReferenceMode.PINNED,
    instant: Temporal.Instant.from("2026-03-08T07:30:00Z"),
    wallClockStatus: status,
    requestedWallTime,
    ...(wallTimeTarget === undefined ? {} : { wallTimeTarget }),
  },
});

describe("getWallClockNote", () => {
  it("is none while live", () => {
    expect(getWallClockNote(INITIAL_WORLD_CLOCK_STATE)).toEqual({
      placement: WallClockNotePlacement.NONE,
    });
  });

  it.each([
    ["a UNIQUE moment", pinned(WallClockStatus.UNIQUE)],
    ["a date-change AMBIGUOUS moment", pinned(WallClockStatus.AMBIGUOUS)],
    ["a UNIQUE wall-time input", pinned(WallClockStatus.UNIQUE, newYorkTarget)],
    [
      "a wall-time GAP on a removed location",
      pinned(WallClockStatus.GAP, newYorkTarget, [almaty]),
    ],
    [
      "a Here entry target after a location shows the device time",
      pinned(WallClockStatus.GAP, hereTarget, [almaty]),
    ],
  ])("is none for %s", (_name, state) => {
    expect(getWallClockNote(state).placement).toBe(WallClockNotePlacement.NONE);
  });

  it("puts a date-change GAP in the date bar", () => {
    expect(getWallClockNote(pinned(WallClockStatus.GAP))).toEqual({
      placement: WallClockNotePlacement.DATE_BAR,
      requestedWallTime,
    });
  });

  it.each([
    [WallClockStatus.GAP, newYorkTarget, [newYork]],
    [WallClockStatus.AMBIGUOUS, newYorkTarget, [newYork]],
    [WallClockStatus.GAP, hereTarget, [newYork]],
  ])("puts a wall-time %s for %j in the row", (status, target, locations) => {
    expect(getWallClockNote(pinned(status, target, locations))).toEqual({
      placement: WallClockNotePlacement.ROW,
      target,
      status,
      requestedWallTime,
    });
  });

  it("finds the targeted location among several", () => {
    expect(
      getWallClockNote(
        pinned(WallClockStatus.GAP, newYorkTarget, [almaty, newYork]),
      ).placement,
    ).toBe(WallClockNotePlacement.ROW);
  });

  it("shows a location target while the Here entry does not exist", () => {
    const almatyTarget: WallTimeTarget = {
      kind: WallTimeTargetKind.LOCATION,
      locationId: almaty.id,
    };
    expect(
      getWallClockNote(pinned(WallClockStatus.GAP, almatyTarget, [almaty]))
        .placement,
    ).toBe(WallClockNotePlacement.ROW);
  });
});
