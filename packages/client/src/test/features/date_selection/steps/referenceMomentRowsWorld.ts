import i18n from "i18next";
import { expect } from "vitest";
import { ONE_DAY } from "@/constants";
import { Temporal } from "@/lib/temporal";
import {
  getEffectiveInstant,
  getReferenceOffsetMinutes,
  INITIAL_WORLD_CLOCK_STATE,
  LocationCommandType,
  reduceLocations,
  type WorldClockState,
} from "@/model";
import { HourFormat } from "@/preferences";
import { type LocationRow, presentLocationRows } from "@/presenter";
import { buildLocation } from "@/test/factories/buildLocation";
import { buildReferenceDay } from "@/test/referenceDay";
import { startWorkCount, type WorkCount } from "@/test/workCounters";
import { ENGLISH_LANGUAGE } from "./dateSelectionWorld";

export const BUDGET_ROW_COUNT = 50;
const REMOVE_BUTTON_SELECTOR = "button[aria-label]";
const ROW_SELECTOR = "li";
const DATE_ELEMENT_SELECTOR = "time";
const DATETIME_ATTRIBUTE = "datetime";

export const firstZones = () =>
  Intl.supportedValuesOf("timeZone").slice(0, BUDGET_ROW_COUNT);

export const localIsoDateAt = (timestamp: string, zone: string) =>
  Temporal.Instant.from(timestamp)
    .toZonedDateTimeISO(zone)
    .toPlainDate()
    .toString();

/**
 * Asserts every zone's rendered row shows its local date at the instant, resolving
 * all rows with a single DOM query and exact aria-label matches.
 * Implements FR1, UX1 of fix-date-change-row-budget-measurement (D4).
 */
export const expectRowsShowDateAt = (timestamp: string, zones: string[]) => {
  const rowsByLabel = new Map(
    [...document.querySelectorAll(REMOVE_BUTTON_SELECTOR)].map((button) => [
      button.getAttribute("aria-label"),
      button.closest(ROW_SELECTOR),
    ]),
  );
  for (const zone of zones) {
    const row = rowsByLabel.get(
      i18n.t("locations.locationMenu", { city: zone }),
    );
    expect(row).toBeTruthy();
    expect(row?.querySelector(DATE_ELEMENT_SELECTOR)).toHaveAttribute(
      DATETIME_ATTRIBUTE,
      localIsoDateAt(timestamp, zone),
    );
  }
};

/**
 * Model and presenter work of a date change on 50 rows, without any rendering.
 * Implements NFR-P1 of fix-date-change-row-budget-measurement (D1-D3);
 * FR3 of replace-wall-clock-row-budgets-with-deterministic-checks (D2).
 */
export const createRowBudgetWorld = () => {
  let state: WorldClockState = INITIAL_WORLD_CLOCK_STATE;
  let startInstant = "";
  let zones: string[] = [];
  let rows: LocationRow[] = [];
  let workCount: WorkCount | undefined;
  const presentRows = (
    locations: WorldClockState["locations"],
    instant: Temporal.Instant,
  ) =>
    presentLocationRows(locations, {
      language: ENGLISH_LANGUAGE,
      hourFormat: HourFormat.H24,
      instant,
      translate: i18n.getFixedT(ENGLISH_LANGUAGE),
      deviceTimeZoneId: state.deviceTimeZoneId,
      homeLocationId: state.homeLocationId,
      referenceOffsetMinutes: getReferenceOffsetMinutes(state, instant),
      referenceDay: buildReferenceDay(instant, state.deviceTimeZoneId),
    });
  const presentDateShift = (days: number) => {
    const outcome = reduceLocations(state, {
      type: LocationCommandType.SHIFT_DATE,
      days,
      now: startInstant,
    });
    if (!outcome.ok) return;
    rows = presentRows(
      outcome.state.locations,
      getEffectiveInstant(outcome.state, Temporal.Instant.from(startInstant)),
    );
  };

  return {
    workCount: () => workCount,
    stop: () => workCount?.stop(),
    prepare: async (timestamp: string, deviceTimeZoneId: string) => {
      await i18n.changeLanguage(ENGLISH_LANGUAGE);
      startInstant = timestamp;
      zones = firstZones();
      state = {
        ...INITIAL_WORLD_CLOCK_STATE,
        locations: zones.map((zone) =>
          buildLocation({ timeZoneId: zone, label: zone }),
        ),
        deviceTimeZoneId,
      };
      presentRows(state.locations, Temporal.Instant.from(startInstant));
    },
    measureDateChange: () => {
      workCount = startWorkCount();
      presentDateShift(ONE_DAY);
      workCount.stop();
    },
    /** Presents the day `days` away from the prepared one, without the work counters. */
    presentDateShift,
    expectRowsCarryDateAt: (timestamp: string) => {
      expect(rows).toHaveLength(BUDGET_ROW_COUNT);
      expect(rows.map((row) => row.localIsoDate)).toEqual(
        zones.map((zone) => localIsoDateAt(timestamp, zone)),
      );
    },
  };
};
