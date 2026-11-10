// Verifies NFR-P1 of add-grid-meeting-range-and-share.
import type { FeatureDescriibeCallbackParams } from "@amiceli/vitest-cucumber";
import { describeFeature, loadFeature } from "@amiceli/vitest-cucumber";
import i18n from "i18next";
import { expect, vi } from "vitest";
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
import {
  type PresentedHourStrip,
  presentHourStrip,
  presentLocationMeetingRange,
} from "@/presenter";
import { startWorkCount, type WorkCount } from "@/test/workCounters";
import {
  HOUR_STRIP_BUDGET_ROW_COUNT,
  HOUR_STRIP_BUDGET_ZONES,
} from "./hourStripBudgetWorld";

const feature = await loadFeature("../grid_view_meeting_budget.feature");

const REFERENCE_ZONE = "Asia/Almaty";
const SAMPLE_INSTANT = "2026-03-08T07:30:00Z";
const MEETING: MeetingRange = {
  start: Temporal.Instant.from("2026-03-08T04:00:00Z"),
  end: Temporal.Instant.from("2026-03-08T06:00:00Z"),
};

const day = getReferenceDay(
  { ...INITIAL_WORLD_CLOCK_STATE, deviceTimeZoneId: REFERENCE_ZONE },
  Temporal.Instant.from(SAMPLE_INSTANT),
);

const presentRows = (meeting: MeetingRange): PresentedHourStrip[] =>
  Array.from({ length: HOUR_STRIP_BUDGET_ROW_COUNT }, (_, row) => {
    const zone = HOUR_STRIP_BUDGET_ZONES[row % HOUR_STRIP_BUDGET_ZONES.length];
    presentLocationMeetingRange(zone, meeting, REFERENCE_ZONE, {
      language: "en",
      hourFormat: HourFormat.H24,
      translate: i18n.getFixedT("en"),
    });
    return presentHourStrip(zone, {
      day,
      referenceZoneId: REFERENCE_ZONE,
      language: "en",
      hourFormat: HourFormat.H24,
    });
  });

describeFeature(feature, (f: FeatureDescriibeCallbackParams) => {
  let firstStrips: PresentedHourStrip[] = [];
  let laterStrips: PresentedHourStrip[] = [];
  let workCount: WorkCount | undefined;

  f.BeforeEachScenario(async () => {
    vi.restoreAllMocks();
    await i18n.changeLanguage("en");
  });
  f.AfterEachScenario(async () => {
    workCount?.stop();
    await i18n.changeLanguage("ru");
  });

  // @add-grid-meeting-range-and-share @NFR-P1
  f.Scenario(
    "A handle move re-presents the spans cheaply",
    ({ Given, When, Then, And }) => {
      Given(
        "the rows and hour strips of 50 locations in 10 zones were presented with the meeting range 09:00–11:00 on 2026-03-08",
        () => {
          firstStrips = presentRows(MEETING);
        },
      );
      When(
        "the end handle moves one track step and the rows are presented again",
        () => {
          const moved = getMeetingRangeAfterHandleMove(
            day,
            MEETING,
            MeetingHandle.END,
            TrackMove.NEXT_STEP,
          );
          workCount = startWorkCount();
          laterStrips = presentRows(moved);
          workCount.stop();
        },
      );
      Then(
        "no formatter is built and no time zone transition is looked up",
        () => {
          expect((workCount as WorkCount).formatters()).toBe(0);
          expect((workCount as WorkCount).transitionLookups()).toBe(0);
        },
      );
      And("every row gets the same hour strip as before", () => {
        laterStrips.forEach((strip, row) => {
          expect(strip).toBe(firstStrips[row]);
        });
      });
    },
  );
});
