// Verifies NFR-P1 of add-grid-hour-cells-and-hour-frame.
import type { FeatureDescriibeCallbackParams } from "@amiceli/vitest-cucumber";
import { describeFeature, loadFeature } from "@amiceli/vitest-cucumber";
import { expect, vi } from "vitest";
import { Temporal } from "@/lib/temporal";
import { getReferenceDay, INITIAL_WORLD_CLOCK_STATE } from "@/model";
import { HourFormat } from "@/preferences";
import { type PresentedHourStrip, presentHourStrip } from "@/presenter";
import {
  MAX_FORMATTERS_PER_ZONE,
  MAX_TRANSITION_LOOKUPS_PER_ZONE,
  startWorkCount,
  type WorkCount,
} from "@/test/workCounters";
import {
  HOUR_STRIP_BUDGET_ROW_COUNT,
  HOUR_STRIP_BUDGET_ZONES,
} from "./hourStripBudgetWorld";

const feature = await loadFeature("../grid_view_hour_strip_budget.feature");

const REFERENCE_ZONE = "Asia/Almaty";
const SAMPLE_INSTANT = "2026-03-08T07:30:00Z";
const ONE_MINUTE_LATER = "2026-03-08T07:31:00Z";
const ANOTHER_DAY = "2026-03-20T07:30:00Z";

const presentRows = (instant: string): PresentedHourStrip[] => {
  const day = getReferenceDay(
    { ...INITIAL_WORLD_CLOCK_STATE, deviceTimeZoneId: REFERENCE_ZONE },
    Temporal.Instant.from(instant),
  );
  return Array.from({ length: HOUR_STRIP_BUDGET_ROW_COUNT }, (_, row) =>
    presentHourStrip(
      HOUR_STRIP_BUDGET_ZONES[row % HOUR_STRIP_BUDGET_ZONES.length],
      {
        day,
        referenceZoneId: REFERENCE_ZONE,
        language: "en",
        hourFormat: HourFormat.H24,
      },
    ),
  );
};

describeFeature(feature, (f: FeatureDescriibeCallbackParams) => {
  let firstStrips: PresentedHourStrip[] = [];
  let workCount: WorkCount | undefined;
  let laterStrips: PresentedHourStrip[] = [];

  f.BeforeEachScenario(() => {
    vi.restoreAllMocks();
  });
  f.AfterEachScenario(() => workCount?.stop());

  // @add-grid-hour-cells-and-hour-frame @NFR-P1
  f.Scenario(
    "A minute tick re-presents nothing",
    ({ Given, When, Then, And }) => {
      Given(
        "the hour strips of 50 rows in 10 zones were presented for 2026-03-08",
        () => {
          firstStrips = presentRows(SAMPLE_INSTANT);
        },
      );
      When("they are presented again one minute later", () => {
        workCount = startWorkCount();
        laterStrips = presentRows(ONE_MINUTE_LATER);
        workCount.stop();
      });
      Then(
        "no formatter is built and no time zone transition is looked up",
        () => {
          expect((workCount as WorkCount).formatters()).toBe(0);
          expect((workCount as WorkCount).transitionLookups()).toBe(0);
        },
      );
      And("every row gets the same strip as before", () => {
        laterStrips.forEach((strip, row) => {
          expect(strip).toBe(firstStrips[row]);
        });
      });
    },
  );

  // @add-grid-hour-cells-and-hour-frame @NFR-P1
  f.Scenario("First presentation is bounded per zone", ({ When, Then }) => {
    When(
      "the hour strips of 50 rows in 10 zones are presented for the first time",
      () => {
        presentRows(ANOTHER_DAY);
        workCount = startWorkCount();
        presentRows(SAMPLE_INSTANT);
        workCount.stop();
      },
    );
    Then(
      "each zone has at most 2 time zone transition lookups and at most 3 formatter builds",
      () => {
        const counts = workCount as WorkCount;
        for (const zone of HOUR_STRIP_BUDGET_ZONES) {
          expect(
            counts.transitionLookupsByZone().get(zone) ?? 0,
          ).toBeLessThanOrEqual(MAX_TRANSITION_LOOKUPS_PER_ZONE);
          expect(counts.formattersByZone().get(zone) ?? 0).toBeLessThanOrEqual(
            MAX_FORMATTERS_PER_ZONE,
          );
        }
      },
    );
  });
});
