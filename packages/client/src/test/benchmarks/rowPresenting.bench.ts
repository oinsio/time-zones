// Implements FR6, verifies NFR-P1 of replace-wall-clock-row-budgets-with-deterministic-checks (D5).
import { bench, describe } from "vitest";
import { ONE_DAY } from "@/constants";
import {
  INITIAL_WORLD_CLOCK_STATE,
  LocationCommandType,
  reduceLocations,
} from "@/model";
import { buildLocation } from "@/test/factories/buildLocation";
import { createRowBudgetWorld } from "../features/date_selection/steps/referenceMomentRowsWorld";
import {
  BUDGET_FIRST_MOMENT,
  BUDGET_ROW_COUNT,
  BUDGET_SECOND_MOMENT,
  buildBudgetLocations,
  presentBudgetRows,
} from "../features/locations/steps/rowBudgetWorld";

const WARMUP_ITERATIONS = 5;
const SAMPLE_ITERATIONS = 20;
const options = {
  warmupIterations: WARMUP_ITERATIONS,
  iterations: SAMPLE_ITERATIONS,
};
const BADGE_DEVICE_TIME_ZONE = "Asia/Almaty";
const BADGE_OTHER_TIME_ZONE = "Asia/Tokyo";
const BADGE_MATCHING_ROW_COUNT = 10;
const DATE_CHANGE_START_MOMENT = "2026-03-08T07:30:00Z";
const DATE_CHANGE_DEVICE_TIME_ZONE = "UTC";

const locations = buildBudgetLocations(BUDGET_ROW_COUNT);
const badgeLocations = locations.map((location, index) =>
  buildLocation({
    label: location.label,
    timeZoneId:
      index < BADGE_MATCHING_ROW_COUNT
        ? BADGE_DEVICE_TIME_ZONE
        : BADGE_OTHER_TIME_ZONE,
  }),
);
const dateChangeWorld = createRowBudgetWorld();
await dateChangeWorld.prepare(
  DATE_CHANGE_START_MOMENT,
  DATE_CHANGE_DEVICE_TIME_ZONE,
);
// Alternating days keep every sample on a day the stop cache does not hold.
let dateShiftDays = -ONE_DAY;

describe("row presenting", () => {
  bench(
    "present 50 rows with time and date",
    () => {
      presentBudgetRows(locations, { timestamp: BUDGET_FIRST_MOMENT });
    },
    options,
  );
  bench(
    "present 50 rows with offsets",
    () => {
      presentBudgetRows(locations, { timestamp: BUDGET_SECOND_MOMENT });
    },
    options,
  );
  bench(
    "present 50 rows with the device time zone badge",
    () => {
      presentBudgetRows(badgeLocations, {
        deviceTimeZoneId: BADGE_DEVICE_TIME_ZONE,
      });
    },
    options,
  );
  bench(
    "reorder 50 locations and present",
    () => {
      const outcome = reduceLocations(
        { ...INITIAL_WORLD_CLOCK_STATE, locations },
        {
          type: LocationCommandType.MOVE_LOCATION,
          id: locations[locations.length - 1].id,
          targetIndex: 0,
        },
      );
      if (outcome.ok) presentBudgetRows(outcome.state.locations);
    },
    options,
  );
  bench(
    "date change on 50 rows",
    () => {
      dateShiftDays = -dateShiftDays;
      dateChangeWorld.presentDateShift(dateShiftDays);
    },
    options,
  );
});
