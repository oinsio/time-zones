// Verifies NFR-P1, NFR-P3 of bind-day-periods-to-sun.
import type { FeatureDescriibeCallbackParams } from "@amiceli/vitest-cucumber";
import { describeFeature, loadFeature } from "@amiceli/vitest-cucumber";
import i18n from "i18next";
import { beforeAll, expect, vi } from "vitest";
import { importWithSunCount, startSolarDayCount } from "@/test/solarDayCounter";
import type { WorkCount } from "@/test/workCounters";
import {
  BUDGET_ANOTHER_DAY,
  BUDGET_ONE_MINUTE_LATER,
  BUDGET_SAMPLE_INSTANT,
  type BudgetModules,
  budgetLocations,
  type PresentedBudget,
  presentBudgetRows,
} from "./dayPeriodsBudgetWorld";

vi.mock("@/model/sun", async (importOriginal) =>
  (await import("@/test/solarDayCounter")).countSunCalls(
    await importOriginal(),
  ),
);

const feature = await loadFeature("../day_periods_budget_unit.feature");

const DISTINCT_COORDINATES = 10;
const MAX_SOLAR_DAYS_PER_COORDINATES = 3;
const MAX_FORMATTERS_PER_ZONE = 3;

describeFeature(feature, (f: FeatureDescriibeCallbackParams) => {
  let modules: BudgetModules;
  let first: PresentedBudget | undefined;
  let later: PresentedBudget | undefined;
  let solarDays = 0;
  let elevations = 0;
  let workCount: WorkCount | undefined;

  beforeAll(async () => {
    modules = await importWithSunCount(async () => ({
      model: await import("@/model"),
      presenter: await import("@/presenter"),
      temporal: await import("@/lib/temporal"),
      workCounters: await import("@/test/workCounters"),
    }));
  });

  f.BeforeEachScenario(async () => {
    await i18n.changeLanguage("en");
  });
  f.AfterEachScenario(() => workCount?.stop());

  const presentCounted = (instant: string) => {
    const sunCount = startSolarDayCount();
    workCount = modules.workCounters.startWorkCount();
    const presented = presentBudgetRows(modules, instant);
    workCount.stop();
    sunCount.stop();
    solarDays = sunCount.solarDays();
    elevations = sunCount.elevations();
    return presented;
  };

  // @bind-day-periods-to-sun @NFR-P1
  f.Scenario("First presentation of 50 rows", ({ Given, When, Then, And }) => {
    Given(
      "50 rows at 10 distinct coordinates in the Time of day colouring",
      () => {
        const distinct = new Set(
          budgetLocations.map((location) =>
            JSON.stringify(modules.model.getSunCoordinates(location)),
          ),
        );
        expect(budgetLocations).toHaveLength(50);
        expect(distinct.size).toBe(DISTINCT_COORDINATES);
        presentBudgetRows(modules, BUDGET_ANOTHER_DAY);
      },
    );
    When(
      "their day tracks and hour strips are presented for the first time in a reference day",
      () => {
        first = presentCounted(BUDGET_SAMPLE_INSTANT);
      },
    );
    Then("the sun was computed for at most 30 solar days", () => {
      expect(solarDays).toBeGreaterThan(0);
      expect(solarDays).toBeLessThanOrEqual(
        DISTINCT_COORDINATES * MAX_SOLAR_DAYS_PER_COORDINATES,
      );
    });
    And("at most 3 formatters were built per zone", () => {
      for (const builds of (workCount as WorkCount)
        .formattersByZone()
        .values()) {
        expect(builds).toBeLessThanOrEqual(MAX_FORMATTERS_PER_ZONE);
      }
    });
  });

  // @bind-day-periods-to-sun @NFR-P1 @NFR-P3
  f.Scenario("A minute later", ({ Given, When, Then, And }) => {
    Given("the rows of the previous scenario were presented", () => {
      first = presentBudgetRows(modules, BUDGET_SAMPLE_INSTANT);
    });
    When(
      "they are presented again one minute later within the same reference day",
      () => {
        later = presentCounted(BUDGET_ONE_MINUTE_LATER);
      },
    );
    Then("nothing was computed for the sun", () => {
      expect([solarDays, elevations]).toEqual([0, 0]);
    });
    And(
      "every row has the same colour stops and the same cells as before",
      () => {
        (later as PresentedBudget).rows.forEach((row, index) => {
          expect(row.dayTrack?.stops).toBe(first?.rows[index].dayTrack?.stops);
          expect((later as PresentedBudget).strips[index]).toBe(
            first?.strips[index],
          );
        });
      },
    );
  });
});
