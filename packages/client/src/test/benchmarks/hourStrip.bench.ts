// Verifies NFR-P1 of add-grid-hour-cells-and-hour-frame.
import { bench, describe } from "vitest";
import { Temporal } from "@/lib/temporal";
import { getReferenceDay, INITIAL_WORLD_CLOCK_STATE } from "@/model";
import { HourFormat } from "@/preferences";
import { presentHourStrip } from "@/presenter";
import {
  HOUR_STRIP_BUDGET_ROW_COUNT,
  HOUR_STRIP_BUDGET_ZONES,
} from "../features/grid_view/steps/hourStripBudgetWorld";

const WARMUP_ITERATIONS = 5;
const SAMPLE_ITERATIONS = 20;
const REFERENCE_ZONE = "Asia/Almaty";
const options = {
  warmupIterations: WARMUP_ITERATIONS,
  iterations: SAMPLE_ITERATIONS,
};
const FIRST_DAY = "2026-03-08T07:30:00Z";
const SECOND_DAY = "2026-03-20T07:30:00Z";

const presentFiftyStrips = (instant: string) => {
  const day = getReferenceDay(
    { ...INITIAL_WORLD_CLOCK_STATE, deviceTimeZoneId: REFERENCE_ZONE },
    Temporal.Instant.from(instant),
  );
  for (let row = 0; row < HOUR_STRIP_BUDGET_ROW_COUNT; row++) {
    presentHourStrip(
      HOUR_STRIP_BUDGET_ZONES[row % HOUR_STRIP_BUDGET_ZONES.length],
      {
        day,
        referenceZoneId: REFERENCE_ZONE,
        language: "en",
        hourFormat: HourFormat.H24,
      },
    );
  }
};
// Alternating days keep every sample on a day the strip cache does not hold.
let isFirstDay = true;

describe("hour strip", () => {
  bench(
    "present 50 hour strips for a new day",
    () => {
      isFirstDay = !isFirstDay;
      presentFiftyStrips(isFirstDay ? FIRST_DAY : SECOND_DAY);
    },
    options,
  );
  bench(
    "present 50 hour strips again at the same day",
    () => {
      presentFiftyStrips(FIRST_DAY);
    },
    options,
  );
});
