// Verifies FR7, FR9 of add-wall-time-input-with-hint (D2).
import { describe, expect, it } from "vitest";
import { DEVICE_TIME_LOCATION_ID } from "@/constants";
import { Temporal } from "@/lib/temporal";
import { buildDeviceTimeLocation } from "./deviceTimeLocation";
import { LocationKind } from "./locationKind";
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
  kind: LocationKind.CITY,
  timeZoneId: "America/New_York",
  label: "New York",
  countryCode: "US",
};
const almaty: Location = {
  id: "Asia/Almaty|Almaty",
  kind: LocationKind.CITY,
  timeZoneId: "Asia/Almaty",
  label: "Almaty",
  countryCode: "KZ",
};
const requestedWallTime = Temporal.PlainTime.from("02:30");
const newYorkTarget: WallTimeTarget = {
  kind: WallTimeTargetKind.LOCATION,
  locationId: newYork.id,
};
const deviceTimeTarget: WallTimeTarget = {
  kind: WallTimeTargetKind.LOCATION,
  locationId: DEVICE_TIME_LOCATION_ID,
};

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
      "a wall-time GAP on a removed device time location",
      pinned(WallClockStatus.GAP, deviceTimeTarget, [almaty]),
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
    [
      WallClockStatus.GAP,
      deviceTimeTarget,
      [buildDeviceTimeLocation("Asia/Almaty")],
    ],
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

  it("shows a location target in the device time zone", () => {
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
