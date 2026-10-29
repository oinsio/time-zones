import i18n from "i18next";
import { expect } from "vitest";
import { ONE_DAY } from "@/constants";
import { Temporal } from "@/lib/temporal";
import {
  getEffectiveInstant,
  getReferenceDay,
  INITIAL_WORLD_CLOCK_STATE,
  LocationCommandType,
  reduceLocations,
  type WorldClockState,
} from "@/model";
import { type LocationRow, presentLocationRows } from "@/presenter";
import { buildLocation } from "@/test/factories/buildLocation";
import {
  MAX_TRANSITION_LOOKUPS_PER_ZONE,
  startWorkCount,
  type WorkCount,
} from "@/test/workCounters";
import { ENGLISH_LANGUAGE } from "./timeSelectionWorld";

export const TRACK_BUDGET_ROW_COUNT = 50;
const PRECISION = 6;

/**
 * Model and presenter work of a time selection and of a date change on 50
 * rows with tracks, without any rendering.
 * Implements NFR-P1, NFR-P2 of add-time-sliders-to-location-cards (D1-D5);
 * FR1, FR3 of replace-wall-clock-row-budgets-with-deterministic-checks (D2).
 */
export const createTrackBudgetWorld = () => {
  let state: WorldClockState = INITIAL_WORLD_CLOCK_STATE;
  let startInstant = "";
  let rows: LocationRow[] = [];
  let presentedState: WorldClockState = INITIAL_WORLD_CLOCK_STATE;
  let workCount: WorkCount | undefined;

  const presentRows = (next: WorldClockState) => {
    const now = Temporal.Instant.from(startInstant);
    return presentLocationRows(next.locations, {
      language: ENGLISH_LANGUAGE,
      instant: getEffectiveInstant(next, now),
      translate: i18n.getFixedT(ENGLISH_LANGUAGE),
      deviceTimeZoneId: next.deviceTimeZoneId,
      homeLocationId: null,
      referenceOffsetMinutes: undefined,
      referenceDay: getReferenceDay(next, now),
    });
  };
  const prepare = async (timestamp: string, deviceTimeZoneId: string) => {
    await i18n.changeLanguage(ENGLISH_LANGUAGE);
    startInstant = timestamp;
    state = {
      ...INITIAL_WORLD_CLOCK_STATE,
      locations: Intl.supportedValuesOf("timeZone")
        .slice(0, TRACK_BUDGET_ROW_COUNT)
        .map((zone) => buildLocation({ timeZoneId: zone, label: zone })),
      deviceTimeZoneId,
    };
    presentRows(state);
  };
  const shiftDateCommand = (days: number) => ({
    type: LocationCommandType.SHIFT_DATE as const,
    days,
    now: startInstant,
  });
  const measure = (command: Parameters<typeof reduceLocations>[1]) => {
    const outcome = reduceLocations(state, command);
    if (!outcome.ok) return;
    presentedState = outcome.state;
    workCount = startWorkCount();
    rows = presentRows(presentedState);
    workCount.stop();
  };

  return {
    workCount: () => workCount,
    stop: () => workCount?.stop(),
    presentAgain: () => {
      workCount = startWorkCount();
      rows = presentRows(presentedState);
      workCount.stop();
    },
    prepare,
    measureSelection: (instant: string) =>
      measure({ type: LocationCommandType.SELECT_INSTANT, instant }),
    measureDateChange: () => measure(shiftDateCommand(ONE_DAY)),
    /** Presents the day `days` away from the prepared one, without the work counters. */
    presentDateShift: (days: number) => {
      const outcome = reduceLocations(state, shiftDateCommand(days));
      if (outcome.ok) rows = presentRows(outcome.state);
    },
    /** Prepares rows for the day before `dayStart`, then moves the date onto it. */
    prepareDayStarting: async (dayStart: string, deviceTimeZoneId: string) => {
      const previousMoment = Temporal.Instant.from(dayStart)
        .toZonedDateTimeISO(deviceTimeZoneId)
        .subtract({ days: ONE_DAY })
        .toInstant()
        .toString();
      await prepare(previousMoment, deviceTimeZoneId);
      measure(shiftDateCommand(ONE_DAY));
    },
    expectNoFormatterBuilt: () => {
      expect(workCount?.formatters()).toBe(0);
      expect(workCount?.displayNames()).toBe(0);
    },
    expectNoTransitionLookup: () =>
      expect(workCount?.transitionLookups()).toBe(0),
    expectLookupsPerZoneAtMost: (maxLookups: number) => {
      expect(maxLookups).toBe(MAX_TRANSITION_LOOKUPS_PER_ZONE);
      const lookupsByZone = workCount?.transitionLookupsByZone();
      expect(lookupsByZone?.size).toBeGreaterThan(0);
      for (const lookups of lookupsByZone?.values() ?? []) {
        expect(lookups).toBeLessThanOrEqual(maxLookups);
      }
    },
    expectEveryHandleAt: (fraction: number) => {
      expect(rows).toHaveLength(TRACK_BUDGET_ROW_COUNT);
      for (const row of rows) {
        expect(row.dayTrack?.fraction).toBeCloseTo(fraction, PRECISION);
      }
    },
    expectEveryTrackForDayStarting: (dayStart: string) => {
      expect(rows).toHaveLength(TRACK_BUDGET_ROW_COUNT);
      const nextDay = reduceLocations(state, shiftDateCommand(ONE_DAY));
      if (!nextDay.ok) throw new Error("the date change was rejected");
      expect(
        getReferenceDay(
          nextDay.state,
          Temporal.Instant.from(startInstant),
        ).start.toString(),
      ).toBe(dayStart);
      for (const row of rows) {
        expect(row.dayTrack?.stops.length).toBeGreaterThan(0);
        expect(row.dayTrack?.hourLabels).toHaveLength(5);
      }
    },
  };
};
