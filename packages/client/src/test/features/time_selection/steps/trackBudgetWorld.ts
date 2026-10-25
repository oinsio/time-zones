import i18n from "i18next";
import { expect } from "vitest";
import { ONE_DAY } from "@/constants";
import { Temporal } from "@/lib/temporal";
import {
  getEffectiveInstant,
  getReferenceDay,
  INITIAL_LOCATIONS_STATE,
  LocationCommandType,
  type LocationsState,
  reduceLocations,
} from "@/model";
import { type LocationRow, presentLocationRows } from "@/presenter";
import { buildLocation } from "@/test/factories/buildLocation";
import { ENGLISH_LANGUAGE } from "./timeSelectionWorld";

export const TRACK_BUDGET_ROW_COUNT = 50;
const PRECISION = 6;

/**
 * Model and presenter work of a time selection and of a date change on 50
 * rows with tracks, without any rendering.
 * Implements NFR-P1, NFR-P2 of add-time-sliders-to-location-cards (D1-D5).
 */
export const createTrackBudgetWorld = () => {
  let state: LocationsState = INITIAL_LOCATIONS_STATE;
  let startInstant = "";
  let rows: LocationRow[] = [];
  let elapsedMs = 0;

  const presentRows = (next: LocationsState) => {
    const now = Temporal.Instant.from(startInstant);
    return presentLocationRows(next.locations, {
      language: ENGLISH_LANGUAGE,
      instant: getEffectiveInstant(next, now),
      translate: i18n.getFixedT(ENGLISH_LANGUAGE),
      deviceTimeZoneId: next.deviceTimeZoneId,
      referenceDay: getReferenceDay(next, now),
    });
  };
  const measure = (command: Parameters<typeof reduceLocations>[1]) => {
    const startedAt = performance.now();
    const outcome = reduceLocations(state, command);
    if (outcome.ok) rows = presentRows(outcome.state);
    elapsedMs = performance.now() - startedAt;
  };

  return {
    elapsedMs: () => elapsedMs,
    prepare: async (timestamp: string, deviceTimeZoneId: string) => {
      await i18n.changeLanguage(ENGLISH_LANGUAGE);
      startInstant = timestamp;
      state = {
        ...INITIAL_LOCATIONS_STATE,
        locations: Intl.supportedValuesOf("timeZone")
          .slice(0, TRACK_BUDGET_ROW_COUNT)
          .map((zone) => buildLocation({ timeZoneId: zone, label: zone })),
        deviceTimeZoneId,
      };
      presentRows(state);
    },
    measureSelection: (instant: string) =>
      measure({ type: LocationCommandType.SELECT_INSTANT, instant }),
    measureDateChange: () =>
      measure({
        type: LocationCommandType.SHIFT_DATE,
        days: ONE_DAY,
        now: startInstant,
      }),
    expectEveryHandleAt: (fraction: number) => {
      expect(rows).toHaveLength(TRACK_BUDGET_ROW_COUNT);
      for (const row of rows) {
        expect(row.dayTrack?.fraction).toBeCloseTo(fraction, PRECISION);
      }
    },
    expectEveryTrackForDayStarting: (dayStart: string) => {
      expect(rows).toHaveLength(TRACK_BUDGET_ROW_COUNT);
      const nextDay = reduceLocations(state, {
        type: LocationCommandType.SHIFT_DATE,
        days: ONE_DAY,
        now: startInstant,
      });
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
