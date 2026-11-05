// Verifies NFR-P1 of show-zone-abbreviations-and-zone-label-setting (ADR-0008): the timing of presenting 50 rows with both zone label parts.
import { bench, describe } from "vitest";
import { buildLocation } from "@/test/factories/buildLocation";
import {
  BUDGET_FIRST_MOMENT,
  BUDGET_ROW_COUNT,
  BUDGET_SECOND_MOMENT,
  presentBudgetRows,
} from "../features/locations/steps/rowBudgetWorld";

const WARMUP_ITERATIONS = 5;
const SAMPLE_ITERATIONS = 20;
const options = {
  warmupIterations: WARMUP_ITERATIONS,
  iterations: SAMPLE_ITERATIONS,
};
/** Zones with an abbreviation pair, one abbreviation and none, in turn. */
const ABBREVIATION_ZONES = [
  "America/New_York",
  "Europe/Moscow",
  "Asia/Almaty",
  "Europe/Dublin",
  "Australia/Adelaide",
];

const locations = Array.from({ length: BUDGET_ROW_COUNT }, (_, index) =>
  buildLocation({
    label: `City ${index}`,
    timeZoneId: ABBREVIATION_ZONES[index % ABBREVIATION_ZONES.length],
  }),
);

describe("zone line", () => {
  bench(
    "present 50 rows with the zone abbreviation and the UTC offset",
    () => {
      presentBudgetRows(locations, { timestamp: BUDGET_FIRST_MOMENT });
    },
    options,
  );
  bench(
    "present 50 rows again at another minute with both zone label parts",
    () => {
      presentBudgetRows(locations, { timestamp: BUDGET_SECOND_MOMENT });
    },
    options,
  );
});
