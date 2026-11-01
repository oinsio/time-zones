// Verifies NFR-P1 of show-clock-change-note-on-location-cards.
import { bench, describe } from "vitest";
import { ONE_DAY } from "@/constants";
import { Temporal } from "@/lib/temporal";
import {
  buildNoteBudgetLocations,
  NOTE_BUDGET_DEVICE_TIME_ZONE,
  NOTE_BUDGET_LATER_MINUTE,
  NOTE_BUDGET_NOW,
} from "../features/locations/steps/clockChangeNoteBudgetWorld";
import { presentBudgetRows } from "../features/locations/steps/rowBudgetWorld";

const WARMUP_ITERATIONS = 5;
const SAMPLE_ITERATIONS = 20;
const options = {
  warmupIterations: WARMUP_ITERATIONS,
  iterations: SAMPLE_ITERATIONS,
};

const locations = buildNoteBudgetLocations();
const presentAt = (timestamp: string) =>
  presentBudgetRows(locations, {
    timestamp,
    deviceTimeZoneId: NOTE_BUDGET_DEVICE_TIME_ZONE,
  });
const shiftedDay = (days: number) =>
  Temporal.Instant.from(NOTE_BUDGET_NOW)
    .toZonedDateTimeISO(NOTE_BUDGET_DEVICE_TIME_ZONE)
    .add({ days })
    .toInstant()
    .toString();
// Alternating days keep every sample on a day the clock change cache does not hold.
let dateShiftDays = -ONE_DAY;
presentAt(NOTE_BUDGET_NOW);

describe("clock change note", () => {
  bench(
    "present 50 rows with clock change notes at another minute",
    () => {
      presentAt(NOTE_BUDGET_LATER_MINUTE);
    },
    options,
  );
  bench(
    "present 50 rows with clock change notes after a date change",
    () => {
      dateShiftDays = -dateShiftDays;
      presentAt(shiftedDay(dateShiftDays));
    },
    options,
  );
});
