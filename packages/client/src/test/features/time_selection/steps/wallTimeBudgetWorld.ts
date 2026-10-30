import { HourFormat } from "@/preferences";
import i18n from "i18next";
import { fakeClock } from "@/lib/temporal";
import {
  getEffectiveInstant,
  getReferenceOffsetMinutes,
  getWallClockNote,
  INITIAL_WORLD_CLOCK_STATE,
  LocationCommandType,
  reduceLocations,
  WallTimeTargetKind,
  type WorldClockState,
} from "@/model";
import { presentLocationRows } from "@/presenter";
import { buildLocation, KNOWN_CITIES } from "@/test/factories/buildLocation";
import { buildReferenceDay } from "@/test/referenceDay";
import {
  BUDGET_ROW_COUNT,
  buildBudgetLocations,
} from "../../locations/steps/rowBudgetWorld";

export const WALL_TIME_BUDGET_NOW = "2026-03-08T07:30:00Z";
const DEVICE_TIME_ZONE = "Asia/Almaty";
const BUDGET_LANGUAGE = "en";

const newYork = buildLocation({
  label: "New York",
  ...KNOWN_CITIES["New York"],
});

/**
 * 50 rows with New York first, for the work bounds of the wall-time input.
 * Implements NFR-P1 of add-wall-time-input-with-hint.
 */
export const buildWallTimeBudgetState = (): WorldClockState => ({
  ...INITIAL_WORLD_CLOCK_STATE,
  deviceTimeZoneId: DEVICE_TIME_ZONE,
  locations: [newYork, ...buildBudgetLocations(BUDGET_ROW_COUNT - 1)],
});

export const typeInNewYork = (
  state: WorldClockState,
  time: string,
): WorldClockState => {
  const outcome = reduceLocations(state, {
    type: LocationCommandType.SET_WALL_TIME,
    target: { kind: WallTimeTargetKind.LOCATION, locationId: newYork.id },
    time,
    date: WALL_TIME_BUDGET_NOW.slice(0, "YYYY-MM-DD".length),
  });
  if (!outcome.ok) throw new Error(outcome.error);
  return outcome.state;
};

/** Presents every row of the state, with its wall-clock note, the way `useLocations` does. */
export const presentBudgetState = (state: WorldClockState) => {
  const now = fakeClock(WALL_TIME_BUDGET_NOW).instant();
  const instant = getEffectiveInstant(state, now);
  return presentLocationRows(state.locations, {
    language: BUDGET_LANGUAGE,
    hourFormat: HourFormat.H24,
    instant,
    translate: i18n.getFixedT(BUDGET_LANGUAGE),
    deviceTimeZoneId: state.deviceTimeZoneId,
    homeLocationId: state.homeLocationId,
    referenceOffsetMinutes: getReferenceOffsetMinutes(state, instant),
    referenceDay: buildReferenceDay(instant, state.deviceTimeZoneId),
    wallClockNote: getWallClockNote(state),
  });
};
