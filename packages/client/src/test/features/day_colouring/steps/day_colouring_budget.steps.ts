// Verifies NFR-P1 of add-day-colouring-setting.
// Verifies NFR-P1 of redesign-cards-grid-and-day-palettes: the day palette re-presents nothing.
import type { FeatureDescriibeCallbackParams } from "@amiceli/vitest-cucumber";
import { describeFeature, loadFeature } from "@amiceli/vitest-cucumber";
import i18n from "i18next";
import { expect, vi } from "vitest";
import {
  DayColouring,
  DayPalette,
  DEFAULT_PREFERENCES,
  PreferencesCommandType,
  reducePreferences,
  type WorkingHours,
} from "@/preferences";
import {
  MAX_FORMATTERS_PER_ZONE,
  MAX_TRANSITION_LOOKUPS_PER_ZONE,
  startWorkCount,
  type WorkCount,
} from "@/test/workCounters";
import {
  BUDGET_ANOTHER_DAY,
  BUDGET_ONE_MINUTE_LATER,
  BUDGET_SAMPLE_INSTANT,
  BUDGET_ZONES,
  type PresentedBudgetRows,
  presentBudgetRows,
} from "./dayColouringBudgetWorld";
import { parseWorkingHoursText } from "./dayColouringChecks";

const feature = await loadFeature("../day_colouring_budget.feature");

describeFeature(feature, (f: FeatureDescriibeCallbackParams) => {
  let workingHours: WorkingHours = parseWorkingHoursText("10:00-18:00");
  let first: PresentedBudgetRows | undefined;
  let later: PresentedBudgetRows | undefined;
  let workCount: WorkCount | undefined;

  f.BeforeEachScenario(async () => {
    vi.restoreAllMocks();
    await i18n.changeLanguage("en");
    first = undefined;
    later = undefined;
  });
  f.AfterEachScenario(() => workCount?.stop());

  const givenWorkingHours = () => {
    workingHours = parseWorkingHoursText("10:00-18:00");
  };

  // @add-day-colouring-setting @NFR-P1
  f.Scenario(
    "First presentation is bounded per zone",
    ({ Given, When, Then }) => {
      Given(
        "the day colouring is Working hours with 10:00-18:00",
        givenWorkingHours,
      );
      When(
        "the day tracks and the hour strips of 50 rows in 10 zones are presented for the first time",
        () => {
          presentBudgetRows(
            BUDGET_ANOTHER_DAY,
            DayColouring.WORKING_HOURS,
            workingHours,
          );
          workCount = startWorkCount();
          presentBudgetRows(
            BUDGET_SAMPLE_INSTANT,
            DayColouring.WORKING_HOURS,
            workingHours,
          );
          workCount.stop();
        },
      );
      Then(
        "each zone has at most 2 time zone transition lookups and at most 3 formatter builds",
        () => {
          const counts = workCount as WorkCount;
          for (const zone of BUDGET_ZONES) {
            expect(
              counts.transitionLookupsByZone().get(zone) ?? 0,
            ).toBeLessThanOrEqual(MAX_TRANSITION_LOOKUPS_PER_ZONE);
            expect(
              counts.formattersByZone().get(zone) ?? 0,
            ).toBeLessThanOrEqual(MAX_FORMATTERS_PER_ZONE);
          }
        },
      );
    },
  );

  // @add-day-colouring-setting @NFR-P1
  f.Scenario(
    "A minute tick re-presents nothing",
    ({ Given, And, When, Then }) => {
      Given(
        "the day colouring is Working hours with 10:00-18:00",
        givenWorkingHours,
      );
      And(
        "the day tracks and the hour strips of 50 rows in 10 zones were presented",
        () => {
          first = presentBudgetRows(
            BUDGET_SAMPLE_INSTANT,
            DayColouring.WORKING_HOURS,
            workingHours,
          );
        },
      );
      When("they are presented again one minute later", () => {
        workCount = startWorkCount();
        later = presentBudgetRows(
          BUDGET_ONE_MINUTE_LATER,
          DayColouring.WORKING_HOURS,
          workingHours,
        );
        workCount.stop();
      });
      Then(
        "no formatter is built and no time zone transition is looked up",
        () => {
          expect((workCount as WorkCount).formatters()).toBe(0);
          expect((workCount as WorkCount).transitionLookups()).toBe(0);
        },
      );
      And(
        "every row gets the same colour stops and the same strip as before",
        () => {
          (later as PresentedBudgetRows).rows.forEach((row, index) => {
            expect(row.dayTrack?.stops).toBe(
              first?.rows[index].dayTrack?.stops,
            );
            expect((later as PresentedBudgetRows).strips[index]).toBe(
              first?.strips[index],
            );
          });
        },
      );
    },
  );

  // @add-day-colouring-setting @NFR-P1
  f.Scenario(
    "Switching the colouring builds no formatter",
    ({ Given, When, Then }) => {
      Given(
        "the day tracks and the hour strips of 50 rows in 10 zones were presented in the Time of day colouring",
        () => {
          presentBudgetRows(
            BUDGET_SAMPLE_INSTANT,
            DayColouring.TIME_OF_DAY,
            workingHours,
          );
        },
      );
      When("they are presented in the Plain colouring", () => {
        workCount = startWorkCount();
        presentBudgetRows(
          BUDGET_SAMPLE_INSTANT,
          DayColouring.PLAIN,
          workingHours,
        );
        workCount.stop();
      });
      Then("no formatter is built", () => {
        expect((workCount as WorkCount).formatters()).toBe(0);
      });
    },
  );

  // @redesign-cards-grid-and-day-palettes @NFR-P1
  f.Scenario(
    "Changing the day palette re-presents nothing",
    ({ Given, When, Then, And }) => {
      Given(
        "the day tracks and the hour strips of 50 rows in 10 zones were presented in the Time of day colouring",
        () => {
          first = presentBudgetRows(
            BUDGET_SAMPLE_INSTANT,
            DayColouring.TIME_OF_DAY,
            workingHours,
          );
        },
      );
      When(
        "the day palette changes to Muted and they are presented again",
        () => {
          const changed = reducePreferences(DEFAULT_PREFERENCES, {
            type: PreferencesCommandType.SET_DAY_PALETTE,
            dayPalette: DayPalette.MUTED,
          });
          workCount = startWorkCount();
          later = presentBudgetRows(
            BUDGET_SAMPLE_INSTANT,
            changed.dayColouring,
            changed.workingHours,
          );
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
      And(
        "every row gets the same colour stops and the same strip as before",
        () => {
          (later as PresentedBudgetRows).rows.forEach((row, index) => {
            expect(row.dayTrack?.stops).toBe(
              first?.rows[index].dayTrack?.stops,
            );
            expect((later as PresentedBudgetRows).strips[index]).toBe(
              first?.strips[index],
            );
          });
        },
      );
    },
  );
});
