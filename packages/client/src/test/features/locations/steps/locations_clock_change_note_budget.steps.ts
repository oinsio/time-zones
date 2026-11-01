// Verifies NFR-P1 of show-clock-change-note-on-location-cards.
import type { FeatureDescriibeCallbackParams } from "@amiceli/vitest-cucumber";
import { describeFeature, loadFeature } from "@amiceli/vitest-cucumber";
import { expect, vi } from "vitest";
import { ONE_DAY } from "@/constants";
import { Temporal } from "@/lib/temporal";
import type { Location } from "@/model";
import {
  MAX_TRANSITION_LOOKUPS_PER_ZONE,
  startWorkCount,
  type WorkCount,
} from "@/test/workCounters";
import {
  buildNoteBudgetLocations,
  NOTE_BUDGET_DEVICE_TIME_ZONE,
  NOTE_BUDGET_LATER_MINUTE,
  NOTE_BUDGET_NOW,
} from "./clockChangeNoteBudgetWorld";
import {
  BUDGET_ROW_COUNT,
  expectNoWarmWork,
  presentBudgetRows,
} from "./rowBudgetWorld";

const feature = await loadFeature(
  "../locations_clock_change_note_budget.feature",
);

describeFeature(feature, (f: FeatureDescriibeCallbackParams) => {
  let locations: Location[] = [];
  let workCount: WorkCount | undefined;

  f.BeforeEachScenario(() => {
    vi.restoreAllMocks();
  });
  f.AfterEachScenario(() => workCount?.stop());

  const presentOptions = (timestamp: string) => ({
    timestamp,
    deviceTimeZoneId: NOTE_BUDGET_DEVICE_TIME_ZONE,
  });

  // @show-clock-change-note-on-location-cards @NFR-P1
  f.Scenario(
    "50 rows with notes within the work bound",
    ({ Given, When, Then, And }) => {
      Given(
        "{int} locations, some of them with a clock change inside the window, whose rows have been presented once",
        (_ctx, count: number) => {
          expect(count).toBe(BUDGET_ROW_COUNT);
          locations = buildNoteBudgetLocations();
          const rows = presentBudgetRows(
            locations,
            presentOptions(NOTE_BUDGET_NOW),
          );
          expect(rows.some((row) => row.clockChangeNote !== undefined)).toBe(
            true,
          );
        },
      );
      When(
        "their rows are presented again at another minute of the same reference day",
        () => {
          workCount = startWorkCount();
          presentBudgetRows(
            locations,
            presentOptions(NOTE_BUDGET_LATER_MINUTE),
          );
          workCount.stop();
        },
      );
      Then("no time zone transition is looked up", () =>
        expect((workCount as WorkCount).transitionLookups()).toBe(0),
      );
      And("no date, time or region name formatter is built", () =>
        expectNoWarmWork(workCount as WorkCount),
      );
    },
  );

  // @show-clock-change-note-on-location-cards @NFR-P1
  f.Scenario(
    "A new reference day searches each zone once",
    ({ Given, When, Then }) => {
      Given(
        "{int} locations whose rows have been presented at {string} with the device time zone {string}",
        (_ctx, count: number, timestamp: string, deviceTimeZoneId: string) => {
          expect(count).toBe(BUDGET_ROW_COUNT);
          locations = buildNoteBudgetLocations();
          presentBudgetRows(locations, { timestamp, deviceTimeZoneId });
        },
      );
      When(
        "the date moves to the next day and the rows are presented again",
        () => {
          const nextDay = Temporal.Instant.from(NOTE_BUDGET_NOW)
            .toZonedDateTimeISO(NOTE_BUDGET_DEVICE_TIME_ZONE)
            .add({ days: ONE_DAY })
            .toInstant();
          workCount = startWorkCount();
          presentBudgetRows(locations, presentOptions(nextDay.toString()));
          workCount.stop();
        },
      );
      Then(
        "at most {int} time zone transitions are looked up per zone",
        (_ctx, maxLookups: number) => {
          expect(maxLookups).toBe(MAX_TRANSITION_LOOKUPS_PER_ZONE);
          const lookupsByZone = (
            workCount as WorkCount
          ).transitionLookupsByZone();
          expect(lookupsByZone.size).toBeGreaterThan(1);
          for (const lookups of lookupsByZone.values()) {
            expect(lookups).toBeLessThanOrEqual(maxLookups);
          }
        },
      );
    },
  );
});
