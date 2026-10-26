// Implements FR6, verifies NFR-P1 of replace-wall-clock-row-budgets-with-deterministic-checks (D5).
import { bench, describe } from "vitest";
import { ONE_DAY } from "@/constants";
import { createTrackBudgetWorld } from "../features/time_selection/steps/trackBudgetWorld";

const WARMUP_ITERATIONS = 5;
const SAMPLE_ITERATIONS = 20;
const options = {
  warmupIterations: WARMUP_ITERATIONS,
  iterations: SAMPLE_ITERATIONS,
};
const START_MOMENT = "2026-03-08T07:30:00Z";
const SELECTED_MOMENT = "2026-03-08T18:00:00Z";
const DEVICE_TIME_ZONE = "UTC";

const trackWorld = createTrackBudgetWorld();
await trackWorld.prepare(START_MOMENT, DEVICE_TIME_ZONE);
// Alternating days keep every sample on a day the stop cache does not hold.
let dateShiftDays = -ONE_DAY;

describe("time selection", () => {
  bench(
    "time selection on 50 rows",
    () => {
      trackWorld.measureSelection(SELECTED_MOMENT);
    },
    options,
  );
  bench(
    "date change on 50 tracks",
    () => {
      dateShiftDays = -dateShiftDays;
      trackWorld.presentDateShift(dateShiftDays);
    },
    options,
  );
});
