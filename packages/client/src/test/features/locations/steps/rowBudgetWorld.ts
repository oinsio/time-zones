// Implements FR1, FR2, NFR-P1 of replace-wall-clock-row-budgets-with-deterministic-checks (D4).
import i18n from "i18next";
import { expect } from "vitest";
import type { SupportedLanguage } from "@/i18n";
import { fakeClock } from "@/lib/temporal";
import { type LocationRow, presentLocationRows } from "@/presenter";
import { UNIT_TEST_DEVICE_TIME_ZONE } from "@/test/deviceTimeZone";
import { buildLocation } from "@/test/factories/buildLocation";
import { buildReferenceDay } from "@/test/referenceDay";
import type { WorkCount } from "@/test/workCounters";

export const BUDGET_ROW_COUNT = 50;
export const BUDGET_FIRST_MOMENT = "2026-07-15T12:00:00Z";
/** Another minute of the same reference day. */
export const BUDGET_SECOND_MOMENT = "2026-07-15T12:07:00Z";
const BUDGET_LANGUAGE: SupportedLanguage = "en";

export const buildBudgetLocations = (count: number) =>
  Array.from({ length: count }, (_, index) =>
    buildLocation({ label: `City ${index}` }),
  );

type BudgetPresenting = {
  timestamp?: string;
  language?: SupportedLanguage;
  deviceTimeZoneId?: string;
};

export function presentBudgetRows(
  locations: ReturnType<typeof buildBudgetLocations>,
  {
    timestamp = BUDGET_FIRST_MOMENT,
    language = BUDGET_LANGUAGE,
    deviceTimeZoneId = UNIT_TEST_DEVICE_TIME_ZONE,
  }: BudgetPresenting = {},
): LocationRow[] {
  const instant = fakeClock(timestamp).instant();
  return presentLocationRows(locations, {
    language,
    instant,
    translate: i18n.getFixedT(language),
    deviceTimeZoneId,
    referenceDay: buildReferenceDay(instant, deviceTimeZoneId),
  });
}

export function expectNoWarmWork(count: WorkCount) {
  expect(count.formatters()).toBe(0);
  expect(count.displayNames()).toBe(0);
  expect(count.transitionLookups()).toBe(0);
}
