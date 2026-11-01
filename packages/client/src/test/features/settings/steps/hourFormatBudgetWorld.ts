// Implements NFR-P1 of add-settings-page-and-device-time-location and add-interface-language-selection: counts the formatters built when rows are presented in an hour format.
import i18n from "i18next";
import { expect } from "vitest";
import { fakeClock } from "@/lib/temporal";
import { getUtcOffsetMinutes, type Location } from "@/model";
import type { HourFormat } from "@/preferences";
import { presentLocationRows } from "@/presenter";
import { buildLocation } from "@/test/factories/buildLocation";
import { buildReferenceDay } from "@/test/referenceDay";
import { startWorkCount, type WorkCount } from "@/test/workCounters";
import {
  BUDGET_FIRST_MOMENT,
  BUDGET_ROW_COUNT,
  BUDGET_SECOND_MOMENT,
  buildBudgetLocations,
} from "../../locations/steps/rowBudgetWorld";

const LANGUAGE = "en";
const BUDGET_DEVICE_ZONE = "Asia/Almaty";
const TIME_ZONES_IN_USE = Intl.supportedValuesOf("timeZone").slice(
  0,
  BUDGET_ROW_COUNT,
);
/** Local time, local date and hour label. */
const LABEL_KIND_COUNT = 3;

const presentIn = (
  locations: readonly Location[],
  timestamp: string,
  hourFormat: HourFormat,
  language: string,
) => {
  const instant = fakeClock(timestamp).instant();
  presentLocationRows(locations, {
    language,
    hourFormat,
    instant,
    translate: i18n.getFixedT(language),
    deviceTimeZoneId: BUDGET_DEVICE_ZONE,
    homeLocationId: null,
    referenceOffsetMinutes: getUtcOffsetMinutes(BUDGET_DEVICE_ZONE, instant),
    referenceDay: buildReferenceDay(instant, BUDGET_DEVICE_ZONE),
  });
};

/** Presents rows once, then presents them again under the work counter. */
export function createHourFormatBudgetCheck() {
  let workCount: WorkCount | undefined;
  let locations: readonly Location[] = [];
  return {
    presentOnce: (
      hourFormat: HourFormat,
      hasDistinctZones = false,
      language = LANGUAGE,
    ) => {
      locations = hasDistinctZones
        ? TIME_ZONES_IN_USE.map((timeZoneId) =>
            buildLocation({ timeZoneId, label: timeZoneId }),
          )
        : buildBudgetLocations(BUDGET_ROW_COUNT);
      presentIn(locations, BUDGET_FIRST_MOMENT, hourFormat, language);
    },
    presentAgain: (hourFormat: HourFormat, language = LANGUAGE) => {
      workCount = startWorkCount();
      presentIn(locations, BUDGET_SECOND_MOMENT, hourFormat, language);
      workCount.stop();
    },
    expectNoFormatter: () => expect(workCount?.formatters()).toBe(0),
    expectOneFormatterPerZoneAndKind: () =>
      expect(workCount?.formatters()).toBeLessThanOrEqual(
        TIME_ZONES_IN_USE.length * LABEL_KIND_COUNT,
      ),
    stop: () => workCount?.stop(),
  };
}
