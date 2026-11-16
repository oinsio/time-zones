// Implements NFR-P1, NFR-P3 of bind-day-periods-to-sun: the rows of the day-period budget.
import i18n from "i18next";
import { DayColouring, DEFAULT_PREFERENCES, HourFormat } from "@/preferences";
import { buildLocation } from "@/test/factories/buildLocation";
import {
  HOUR_STRIP_BUDGET_ROW_COUNT,
  HOUR_STRIP_BUDGET_ZONES,
} from "../../grid_view/steps/hourStripBudgetWorld";

export const BUDGET_REFERENCE_ZONE = "Asia/Almaty";
export const BUDGET_SAMPLE_INSTANT = "2026-06-15T06:00:00Z";
export const BUDGET_ONE_MINUTE_LATER = "2026-06-15T06:01:00Z";
export const BUDGET_ANOTHER_DAY = "2026-06-23T06:00:00Z";
const LANGUAGE = "en";

/** The modules loaded afresh so that they bind to the counted sun module. */
export type BudgetModules = {
  model: typeof import("@/model");
  presenter: typeof import("@/presenter");
  temporal: typeof import("@/lib/temporal");
  workCounters: typeof import("@/test/workCounters");
};

export const budgetLocations = Array.from(
  { length: HOUR_STRIP_BUDGET_ROW_COUNT },
  (_, row) =>
    buildLocation({
      label: `Row ${row}`,
      timeZoneId: HOUR_STRIP_BUDGET_ZONES[row % HOUR_STRIP_BUDGET_ZONES.length],
    }),
);

/** Presents the day tracks and the hour strips of the 50 rows in the Time of day colouring. */
export const presentBudgetRows = (modules: BudgetModules, instant: string) => {
  const { model, presenter, temporal } = modules;
  const now = temporal.Temporal.Instant.from(instant);
  const referenceDay = model.getReferenceDay(
    {
      ...model.INITIAL_WORLD_CLOCK_STATE,
      deviceTimeZoneId: BUDGET_REFERENCE_ZONE,
    },
    now,
  );
  const rows = presenter.presentLocationRows(budgetLocations, {
    language: LANGUAGE,
    hourFormat: HourFormat.H24,
    dayColouring: DayColouring.TIME_OF_DAY,
    workingHours: DEFAULT_PREFERENCES.workingHours,
    zoneLabelParts: DEFAULT_PREFERENCES.zoneLabelParts,
    instant: now,
    translate: i18n.getFixedT(LANGUAGE),
    deviceTimeZoneId: BUDGET_REFERENCE_ZONE,
    homeLocationId: null,
    referenceOffsetMinutes: undefined,
    referenceDay,
  });
  const strips = budgetLocations.map((location) =>
    presenter.presentHourStrip(location.timeZoneId, {
      day: referenceDay,
      coordinates: model.getSunCoordinates(location),
      referenceZoneId: BUDGET_REFERENCE_ZONE,
      language: LANGUAGE,
      hourFormat: HourFormat.H24,
      dayColouring: DayColouring.TIME_OF_DAY,
      workingHours: DEFAULT_PREFERENCES.workingHours,
    }),
  );
  return { rows, strips };
};

export type PresentedBudget = ReturnType<typeof presentBudgetRows>;
