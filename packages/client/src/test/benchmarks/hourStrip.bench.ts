// Verifies NFR-P1 of add-grid-hour-cells-and-hour-frame.
// Verifies NFR-P1 of add-day-colouring-setting: the Working hours colouring.
// Verifies NFR-P1 of move-meeting-range-and-extend-past-midnight.

import { bench, describe } from "vitest";
import { Temporal } from "@/lib/temporal";
import {
  getReferenceDay,
  getZoneCoordinates,
  INITIAL_WORLD_CLOCK_STATE,
} from "@/model";
import { DayColouring, DEFAULT_WORKING_HOURS, HourFormat } from "@/preferences";
import { presentHourStrip } from "@/presenter";
import { TIME_OF_DAY_CONTEXT } from "@/test/dayColouringContext";
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

const presentFiftyStrips = (
  instant: string,
  colouringContext: {
    dayColouring: DayColouring;
    workingHours: typeof DEFAULT_WORKING_HOURS;
  } = TIME_OF_DAY_CONTEXT,
) => {
  const day = getReferenceDay(
    { ...INITIAL_WORLD_CLOCK_STATE, deviceTimeZoneId: REFERENCE_ZONE },
    Temporal.Instant.from(instant),
  );
  for (let row = 0; row < HOUR_STRIP_BUDGET_ROW_COUNT; row++) {
    presentHourStrip(
      HOUR_STRIP_BUDGET_ZONES[row % HOUR_STRIP_BUDGET_ZONES.length],
      {
        day,
        coordinates: getZoneCoordinates(
          HOUR_STRIP_BUDGET_ZONES[row % HOUR_STRIP_BUDGET_ZONES.length],
        ),
        referenceZoneId: REFERENCE_ZONE,
        language: "en",
        hourFormat: HourFormat.H24,
        ...colouringContext,
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
    "present 50 hour strips in Working hours for a new day",
    () => {
      isFirstDay = !isFirstDay;
      presentFiftyStrips(isFirstDay ? FIRST_DAY : SECOND_DAY, {
        dayColouring: DayColouring.WORKING_HOURS,
        workingHours: DEFAULT_WORKING_HOURS,
      });
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
  // The tail grows from 0 to 1 cell: 21:00–23:00 to 21:00–23:30 in Almaty.
  const presentFiftyStripsWithTail = (tailCellCount: number) => {
    const day = getReferenceDay(
      { ...INITIAL_WORLD_CLOCK_STATE, deviceTimeZoneId: REFERENCE_ZONE },
      Temporal.Instant.from(FIRST_DAY),
    );
    for (let row = 0; row < HOUR_STRIP_BUDGET_ROW_COUNT; row++) {
      const zone =
        HOUR_STRIP_BUDGET_ZONES[row % HOUR_STRIP_BUDGET_ZONES.length];
      presentHourStrip(zone, {
        day,
        coordinates: getZoneCoordinates(zone),
        referenceZoneId: REFERENCE_ZONE,
        language: "en",
        hourFormat: HourFormat.H24,
        ...TIME_OF_DAY_CONTEXT,
        tailCellCount,
      });
    }
  };
  bench(
    "present 50 hour strips when the strip tail grows",
    () => {
      presentFiftyStripsWithTail(0);
      presentFiftyStripsWithTail(1);
    },
    options,
  );
});
