// Verifies FR3, FR4, FR9, FR10, FR13 of add-wall-time-input-with-hint (D1).
import { describe, expect, it } from "vitest";
import { Temporal } from "@/lib/temporal";
import {
  INITIAL_WORLD_CLOCK_STATE,
  type Location,
  type LocationCommand,
  LocationCommandType,
  LocationErrorCode,
  reduceLocations,
  type WorldClockState,
} from "./locations";
import {
  ReferenceMode,
  type WallTimeTarget,
  WallTimeTargetKind,
} from "./referenceMoment";
import { WallClockStatus } from "./wallClock";

const newYork: Location = {
  id: "America/New_York|New York",
  timeZoneId: "America/New_York",
  label: "New York",
  countryCode: "US",
};
const moscow: Location = {
  id: "Europe/Moscow|Moscow",
  timeZoneId: "Europe/Moscow",
  label: "Moscow",
  countryCode: "RU",
};
const almaty: Location = {
  id: "Asia/Almaty|Almaty",
  timeZoneId: "Asia/Almaty",
  label: "Almaty",
  countryCode: "KZ",
};
const newYorkTarget = {
  kind: WallTimeTargetKind.LOCATION,
  locationId: newYork.id,
} as const;
const hereTarget = { kind: WallTimeTargetKind.HERE_ENTRY } as const;

const stateWith = (...locations: Location[]): WorldClockState => ({
  ...INITIAL_WORLD_CLOCK_STATE,
  deviceTimeZoneId: "Asia/Almaty",
  locations,
});
const setWallTime = (
  target: WallTimeTarget,
  time: string,
  date: string,
): LocationCommand => ({
  type: LocationCommandType.SET_WALL_TIME,
  target,
  time,
  date,
});

function pinnedOf(state: WorldClockState) {
  if (state.reference.mode !== ReferenceMode.PINNED) {
    throw new Error("expected a pinned moment");
  }
  return state.reference;
}

describe("SET_WALL_TIME resolves the typed wall-clock time", () => {
  it.each([
    ["10:40", "2026-03-08", "2026-03-08T14:40:00Z"],
    ["23:00", "2026-03-08", "2026-03-09T03:00:00Z"],
  ])("pins %s in New York on %s to %s as UNIQUE", (time, date, expected) => {
    const result = reduceLocations(
      stateWith(almaty, newYork),
      setWallTime(newYorkTarget, time, date),
    );
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    const pinned = pinnedOf(result.state);
    expect(pinned.instant.toString()).toBe(
      Temporal.Instant.from(expected).toString(),
    );
    expect(pinned.wallClockStatus).toBe(WallClockStatus.UNIQUE);
    expect(pinned.wallTimeTarget).toEqual(newYorkTarget);
  });

  it.each([
    ["02:30", "2026-03-08", "2026-03-08T07:30:00Z", WallClockStatus.GAP],
    ["01:30", "2026-11-01", "2026-11-01T05:30:00Z", WallClockStatus.AMBIGUOUS],
  ])("reports %s on %s as %s", (time, date, expected, status) => {
    const result = reduceLocations(
      stateWith(almaty, newYork),
      setWallTime(newYorkTarget, time, date),
    );
    if (!result.ok) throw new Error("expected ok");
    const pinned = pinnedOf(result.state);
    expect(pinned.instant.toString()).toBe(
      Temporal.Instant.from(expected).toString(),
    );
    expect(pinned.wallClockStatus).toBe(status);
    expect(pinned.requestedWallTime.toString()).toBe(
      Temporal.PlainTime.from(time).toString(),
    );
  });

  it("resolves the Here entry in the device time zone", () => {
    const result = reduceLocations(
      stateWith(moscow),
      setWallTime(hereTarget, "08:00", "2026-03-08"),
    );
    if (!result.ok) throw new Error("expected ok");
    expect(pinnedOf(result.state).instant.toString()).toBe(
      Temporal.Instant.from("2026-03-08T03:00:00Z").toString(),
    );
  });

  it("rejects the Here entry while a location shows the device time", () => {
    const result = reduceLocations(
      stateWith(almaty),
      setWallTime(hereTarget, "08:00", "2026-03-08"),
    );
    expect(result).toEqual({
      ok: false,
      error: LocationErrorCode.LOCATION_NOT_FOUND,
    });
  });

  it("rejects an unknown location", () => {
    const result = reduceLocations(
      stateWith(almaty),
      setWallTime(newYorkTarget, "08:00", "2026-03-08"),
    );
    expect(result).toEqual({
      ok: false,
      error: LocationErrorCode.LOCATION_NOT_FOUND,
    });
  });

  it.each([
    ["25:00", "2026-03-08", LocationErrorCode.INVALID_TIME],
    ["9:30", "2026-03-08", LocationErrorCode.INVALID_TIME],
    ["09:5", "2026-03-08", LocationErrorCode.INVALID_TIME],
    ["10:60", "2026-03-08", LocationErrorCode.INVALID_TIME],
    ["10:40", "2026-02-30", LocationErrorCode.INVALID_DATE],
    ["10:40", "2026-13-01", LocationErrorCode.INVALID_DATE],
    ["23:00", "+275760-09-13", LocationErrorCode.DATE_OUT_OF_RANGE],
  ])("rejects %s on %s with %s", (time, date, error) => {
    expect(
      reduceLocations(
        stateWith(newYork),
        setWallTime(newYorkTarget, time, date),
      ),
    ).toEqual({ ok: false, error });
  });

  it("returns the same state for the same command twice", () => {
    const command = setWallTime(newYorkTarget, "10:40", "2026-03-08");
    const first = reduceLocations(stateWith(newYork), command);
    if (!first.ok) throw new Error("expected ok");
    const second = reduceLocations(first.state, command);
    if (!second.ok) throw new Error("expected ok");
    expect(second.state).toBe(first.state);
  });

  it("treats the same instant in another row as a change", () => {
    const first = reduceLocations(
      stateWith(newYork, moscow),
      setWallTime(newYorkTarget, "10:40", "2026-03-08"),
    );
    if (!first.ok) throw new Error("expected ok");
    const moscowTarget = {
      kind: WallTimeTargetKind.LOCATION,
      locationId: moscow.id,
    } as const;
    const second = reduceLocations(
      first.state,
      setWallTime(moscowTarget, "17:40", "2026-03-08"),
    );
    if (!second.ok) throw new Error("expected ok");
    expect(pinnedOf(second.state).wallTimeTarget).toEqual(moscowTarget);
  });

  it.each([
    [
      {
        type: LocationCommandType.SELECT_INSTANT,
        instant: "2026-03-08T15:00:00Z",
      },
    ],
    [
      {
        type: LocationCommandType.SHIFT_DATE,
        days: 1,
        now: "2026-03-08T07:30:00Z",
      },
    ],
    [{ type: LocationCommandType.RESET_TO_NOW }],
  ] as [LocationCommand][])("%j leaves no wall-time target", (command) => {
    const typed = reduceLocations(
      stateWith(newYork),
      setWallTime(newYorkTarget, "02:30", "2026-03-08"),
    );
    if (!typed.ok) throw new Error("expected ok");
    const after = reduceLocations(typed.state, command);
    if (!after.ok) throw new Error("expected ok");
    const reference = after.state.reference;
    expect(
      reference.mode === ReferenceMode.PINNED && reference.wallTimeTarget,
    ).toBeFalsy();
  });

  it("is plain JSON", () => {
    const command = setWallTime(newYorkTarget, "10:40", "2026-03-08");
    expect(JSON.parse(JSON.stringify(command))).toEqual(command);
  });

  it("accepts the last minute of the hour", () => {
    const result = reduceLocations(
      stateWith(newYork),
      setWallTime(newYorkTarget, "10:59", "2026-03-10"),
    );
    expect(result.ok).toBe(true);
  });

  it("replaces a pinned UNIQUE status of the same instant with the typed outcome", () => {
    const selected = reduceLocations(stateWith(newYork), {
      type: LocationCommandType.SELECT_INSTANT,
      instant: "2026-11-01T05:30:00Z",
    });
    if (!selected.ok) throw new Error("expected ok");
    const result = reduceLocations(
      selected.state,
      setWallTime(newYorkTarget, "01:30", "2026-11-01"),
    );
    if (!result.ok) throw new Error("expected ok");
    expect(pinnedOf(result.state).wallClockStatus).toBe(
      WallClockStatus.AMBIGUOUS,
    );
  });

  it("replaces the outcome of the same instant and target", () => {
    const unique = reduceLocations(
      stateWith(newYork),
      setWallTime(newYorkTarget, "03:30", "2026-03-08"),
    );
    if (!unique.ok) throw new Error("expected ok");
    const gap = reduceLocations(
      unique.state,
      setWallTime(newYorkTarget, "02:30", "2026-03-08"),
    );
    if (!gap.ok) throw new Error("expected ok");
    expect(pinnedOf(gap.state).wallClockStatus).toBe(WallClockStatus.GAP);
  });

  it("moves to another instant of the same target and outcome", () => {
    const first = reduceLocations(
      stateWith(newYork),
      setWallTime(newYorkTarget, "10:40", "2026-03-08"),
    );
    if (!first.ok) throw new Error("expected ok");
    const second = reduceLocations(
      first.state,
      setWallTime(newYorkTarget, "11:40", "2026-03-08"),
    );
    if (!second.ok) throw new Error("expected ok");
    expect(pinnedOf(second.state).instant.toString()).toBe(
      "2026-03-08T15:40:00Z",
    );
  });
});
