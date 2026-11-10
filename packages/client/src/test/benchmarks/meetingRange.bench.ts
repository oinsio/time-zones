// Verifies NFR-P1 of add-grid-meeting-range-and-share.
import i18n from "i18next";
import { bench, describe } from "vitest";
import { Temporal } from "@/lib/temporal";
import {
  getMeetingRangeAfterHandleMove,
  getReferenceDay,
  INITIAL_WORLD_CLOCK_STATE,
  MeetingHandle,
  type MeetingRange,
  TrackMove,
} from "@/model";
import { HourFormat } from "@/preferences";
import { presentLocationMeetingRange } from "@/presenter";
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

const day = getReferenceDay(
  { ...INITIAL_WORLD_CLOCK_STATE, deviceTimeZoneId: REFERENCE_ZONE },
  Temporal.Instant.from("2026-03-08T07:30:00Z"),
);
const MEETING: MeetingRange = {
  start: Temporal.Instant.from("2026-03-08T04:00:00Z"),
  end: Temporal.Instant.from("2026-03-08T06:00:00Z"),
};
const presentation = {
  language: "en",
  hourFormat: HourFormat.H24,
  translate: i18n.getFixedT("en"),
} as const;

describe("meeting range", () => {
  bench(
    "present the spans of 50 rows after a handle move",
    () => {
      const moved = getMeetingRangeAfterHandleMove(
        day,
        MEETING,
        MeetingHandle.END,
        TrackMove.NEXT_STEP,
      );
      for (let row = 0; row < HOUR_STRIP_BUDGET_ROW_COUNT; row++) {
        presentLocationMeetingRange(
          HOUR_STRIP_BUDGET_ZONES[row % HOUR_STRIP_BUDGET_ZONES.length],
          moved,
          REFERENCE_ZONE,
          presentation,
        );
      }
    },
    options,
  );
});
