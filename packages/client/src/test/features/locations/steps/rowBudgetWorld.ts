// Implements FR1, FR2, NFR-P1 of replace-wall-clock-row-budgets-with-deterministic-checks (D4).

import i18n from "i18next";
import { expect } from "vitest";
import { fakeClock } from "@/lib/temporal";
import type { InterfaceLanguageCode } from "@/locales";
import { getUtcOffsetMinutes, type Location } from "@/model";
import { DEFAULT_PREFERENCES, HourFormat } from "@/preferences";
import { type LocationRow, presentLocationRows } from "@/presenter";
import { TIME_OF_DAY_CONTEXT } from "@/test/dayColouringContext";
import { UNIT_TEST_DEVICE_TIME_ZONE } from "@/test/deviceTimeZone";
import { buildLocation } from "@/test/factories/buildLocation";
import { buildReferenceDay } from "@/test/referenceDay";
import {
  MAX_FORMATTERS_PER_ZONE,
  startWorkCount,
  type WorkCount,
} from "@/test/workCounters";

export const BUDGET_ROW_COUNT = 50;
export const BUDGET_FIRST_MOMENT = "2026-07-15T12:00:00Z";
/** Another minute of the same reference day. */
export const BUDGET_SECOND_MOMENT = "2026-07-15T12:07:00Z";
const BUDGET_LANGUAGE: InterfaceLanguageCode = "en";

export const buildBudgetLocations = (count: number) =>
  Array.from({ length: count }, (_, index) =>
    buildLocation({ label: `City ${index}` }),
  );

type BudgetPresenting = {
  timestamp?: string;
  language?: InterfaceLanguageCode;
  deviceTimeZoneId?: string;
  /** Presents the rows with this location as home (set-home-location-and-show-differences). */
  homeLocation?: Location;
  hourFormat?: HourFormat;
};

export function presentBudgetRows(
  locations: readonly Location[],
  {
    timestamp = BUDGET_FIRST_MOMENT,
    language = BUDGET_LANGUAGE,
    deviceTimeZoneId = UNIT_TEST_DEVICE_TIME_ZONE,
    homeLocation,
    hourFormat = HourFormat.H24,
  }: BudgetPresenting = {},
): LocationRow[] {
  const instant = fakeClock(timestamp).instant();
  return presentLocationRows(locations, {
    language,
    hourFormat,
    ...TIME_OF_DAY_CONTEXT,
    zoneLabelParts: DEFAULT_PREFERENCES.zoneLabelParts,
    instant,
    translate: i18n.getFixedT(language),
    deviceTimeZoneId,
    homeLocationId: homeLocation?.id ?? null,
    referenceOffsetMinutes: homeLocation
      ? getUtcOffsetMinutes(homeLocation.timeZoneId, instant)
      : undefined,
    referenceDay: buildReferenceDay(
      instant,
      homeLocation?.timeZoneId ?? deviceTimeZoneId,
    ),
  });
}

export function expectNoWarmWork(count: WorkCount) {
  expect(count.formatters()).toBe(0);
  expect(count.displayNames()).toBe(0);
  expect(count.transitionLookups()).toBe(0);
}

/** Presents rows once, then again under the work counter, and asserts that nothing was built. */
export function createWarmRowsCheck(hourFormat: HourFormat = HourFormat.H24) {
  let locations: Location[] = [];
  let workCount: WorkCount | undefined;
  let presentedRows: LocationRow[] = [];
  return {
    presentOnce: (count: number) => {
      expect(count).toBe(BUDGET_ROW_COUNT);
      locations = buildBudgetLocations(count);
      presentBudgetRows(locations, { hourFormat });
    },
    presentAgain: () => {
      workCount = startWorkCount();
      presentedRows = presentBudgetRows(locations, {
        timestamp: BUDGET_SECOND_MOMENT,
        hourFormat,
      });
      workCount.stop();
    },
    expectNoWarmWork: () => expectNoWarmWork(workCount as WorkCount),
    expectDayPeriodMarkersSplit: () =>
      presentedRows.forEach((row) =>
        expect(row.localTimeParts.dayPeriodMarker).not.toBe(""),
      ),
    stop: () => workCount?.stop(),
  };
}

/** Several zones were presented, and none of them got more than the allowed formatters. */
export function expectFormattersPerZoneAtMost(
  count: WorkCount,
  maxFormatters: number,
) {
  expect(maxFormatters).toBe(MAX_FORMATTERS_PER_ZONE);
  expect(count.formattersByZone().size).toBeGreaterThan(1);
  for (const formatterCount of count.formattersByZone().values()) {
    expect(formatterCount).toBeLessThanOrEqual(maxFormatters);
  }
}
