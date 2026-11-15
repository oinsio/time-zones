// Implements NFR-P1 of add-day-colouring-setting: the rows of the day colouring budget.
import i18n from "i18next";
import { Temporal } from "@/lib/temporal";
import { getReferenceDay, INITIAL_WORLD_CLOCK_STATE } from "@/model";
import {
  type DayColouring,
  DEFAULT_PREFERENCES,
  HourFormat,
  type WorkingHours,
} from "@/preferences";
import {
  type LocationRow,
  type PresentedHourStrip,
  presentHourStrip,
  presentLocationRows,
} from "@/presenter";
import { buildLocation } from "@/test/factories/buildLocation";
import {
  HOUR_STRIP_BUDGET_ROW_COUNT,
  HOUR_STRIP_BUDGET_ZONES,
} from "../../grid_view/steps/hourStripBudgetWorld";

const REFERENCE_ZONE = "Asia/Almaty";
const LANGUAGE = "en";
export const BUDGET_SAMPLE_INSTANT = "2026-06-15T06:00:00Z";
export const BUDGET_ONE_MINUTE_LATER = "2026-06-15T06:01:00Z";
export const BUDGET_ANOTHER_DAY = "2026-06-23T06:00:00Z";

const locations = Array.from(
  { length: HOUR_STRIP_BUDGET_ROW_COUNT },
  (_, row) =>
    buildLocation({
      label: `Row ${row}`,
      timeZoneId: HOUR_STRIP_BUDGET_ZONES[row % HOUR_STRIP_BUDGET_ZONES.length],
    }),
);

export type PresentedBudgetRows = {
  rows: LocationRow[];
  strips: PresentedHourStrip[];
};

/** Presents the day tracks and the hour strips of the 50 budget rows. */
export const presentBudgetRows = (
  instant: string,
  dayColouring: DayColouring,
  workingHours: WorkingHours,
): PresentedBudgetRows => {
  const now = Temporal.Instant.from(instant);
  const state = {
    ...INITIAL_WORLD_CLOCK_STATE,
    deviceTimeZoneId: REFERENCE_ZONE,
  };
  const referenceDay = getReferenceDay(state, now);
  const rows = presentLocationRows(locations, {
    language: LANGUAGE,
    hourFormat: HourFormat.H24,
    dayColouring,
    workingHours,
    zoneLabelParts: DEFAULT_PREFERENCES.zoneLabelParts,
    instant: now,
    translate: i18n.getFixedT(LANGUAGE),
    deviceTimeZoneId: REFERENCE_ZONE,
    homeLocationId: null,
    referenceOffsetMinutes: undefined,
    referenceDay,
  });
  const strips = locations.map((location) =>
    presentHourStrip(location.timeZoneId, {
      day: referenceDay,
      referenceZoneId: REFERENCE_ZONE,
      language: LANGUAGE,
      hourFormat: HourFormat.H24,
      dayColouring,
      workingHours,
    }),
  );
  return { rows, strips };
};

export const BUDGET_ZONES = HOUR_STRIP_BUDGET_ZONES;
