// Verifies FR1, FR2, FR3 of select-date-with-calendar-and-now (D1).
import { Temporal } from "@/lib/temporal";
import {
  INITIAL_LOCATIONS_STATE,
  type LocationCommand,
  LocationCommandType,
  type LocationsState,
  ReferenceMode,
  reduceLocations,
  WallClockStatus,
} from "@/model";

export const NOW = "2026-03-08T07:30:00Z";
export const MAX_INSTANT = "+275760-09-13T00:00:00Z";

export const liveState = (deviceTimeZoneId: string): LocationsState => ({
  ...INITIAL_LOCATIONS_STATE,
  deviceTimeZoneId,
});

export const pinnedState = (
  deviceTimeZoneId: string,
  instant: string,
): LocationsState => ({
  ...liveState(deviceTimeZoneId),
  reference: {
    mode: ReferenceMode.PINNED,
    instant: Temporal.Instant.from(instant),
    wallClockStatus: WallClockStatus.UNIQUE,
    requestedWallTime: Temporal.PlainTime.from("12:30"),
  },
});

export const shift = (days: number, now = NOW): LocationCommand => ({
  type: LocationCommandType.SHIFT_DATE,
  days,
  now,
});

export const setDate = (date: string, now = NOW): LocationCommand => ({
  type: LocationCommandType.SET_DATE,
  date,
  now,
});

export function reduceAll(state: LocationsState, commands: LocationCommand[]) {
  let current = state;
  for (const command of commands) {
    const outcome = reduceLocations(current, command);
    if (!outcome.ok) throw new Error(outcome.error);
    current = outcome.state;
  }
  return current;
}

export const pinnedInstantOf = (state: LocationsState) =>
  state.reference.mode === ReferenceMode.PINNED
    ? state.reference.instant.toString()
    : undefined;
