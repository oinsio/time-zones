// Verifies NFR-P1, NFR-P3 of bind-day-periods-to-sun: reports the timings of the day-period
// bounds counted by `day_periods_budget_unit.feature`; never asserted (ADR-0008).
import { bench, describe } from "vitest";
import { Temporal } from "@/lib/temporal";
import {
  getDayPeriodBoundaries,
  getReferenceDay,
  getZoneCoordinates,
  INITIAL_WORLD_CLOCK_STATE,
} from "@/model";
import { HOUR_STRIP_BUDGET_ZONES } from "../features/grid_view/steps/hourStripBudgetWorld";

const WARMUP_ITERATIONS = 5;
const SAMPLE_ITERATIONS = 20;
const REFERENCE_ZONE = "Asia/Almaty";
const FIRST_DAY = "2026-06-15T06:00:00Z";
const SECOND_DAY = "2026-06-23T06:00:00Z";
const options = {
  warmupIterations: WARMUP_ITERATIONS,
  iterations: SAMPLE_ITERATIONS,
};

const dayOf = (instant: string) =>
  getReferenceDay(
    { ...INITIAL_WORLD_CLOCK_STATE, deviceTimeZoneId: REFERENCE_ZONE },
    Temporal.Instant.from(instant),
  );
const coordinatesOfZones = HOUR_STRIP_BUDGET_ZONES.flatMap((zone) => {
  const coordinates = getZoneCoordinates(zone);
  return coordinates === undefined ? [] : [coordinates];
});

// Alternating days keep every sample on a day the boundary cache does not hold.
let isFirstDay = true;

describe("day-period boundaries", () => {
  bench(
    "compute the boundaries of 10 coordinates for a new day",
    () => {
      isFirstDay = !isFirstDay;
      const day = dayOf(isFirstDay ? FIRST_DAY : SECOND_DAY);
      for (const coordinates of coordinatesOfZones) {
        getDayPeriodBoundaries(coordinates, day);
      }
    },
    options,
  );
  bench(
    "read the boundaries of 10 coordinates again at the same day",
    () => {
      const day = dayOf(FIRST_DAY);
      for (const coordinates of coordinatesOfZones) {
        getDayPeriodBoundaries(coordinates, day);
      }
    },
    options,
  );
});
