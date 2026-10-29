import type { FeatureDescriibeCallbackParams } from "@amiceli/vitest-cucumber";
import { describeFeature, loadFeature } from "@amiceli/vitest-cucumber";
import { expect } from "vitest";
import type { WorldClockState } from "@/model";
import { startWorkCount } from "@/test/workCounters";
import { startZoneLookupCount } from "@/test/zoneLookupCounter";
import {
  buildWallTimeBudgetState,
  presentBudgetState,
  typeInNewYork,
  WALL_TIME_BUDGET_NOW,
} from "./wallTimeBudgetWorld";

const feature = await loadFeature("../time_selection_wall_time_budget.feature");

describeFeature(feature, (f: FeatureDescriibeCallbackParams) => {
  let state: WorldClockState;

  f.BeforeEachScenario(() => {
    state = buildWallTimeBudgetState();
  });

  const givenInstant = (_ctx: unknown, timestamp: string) =>
    expect(timestamp).toBe(WALL_TIME_BUDGET_NOW);
  const givenRowsPresented = () => {
    presentBudgetState(state);
  };

  // @add-wall-time-input-with-hint @NFR-P1
  f.Scenario(
    "No new formatter after a wall-time input",
    ({ Given, And, When, Then }) => {
      let workCount: ReturnType<typeof startWorkCount>;
      Given("the current instant is {string}", givenInstant);
      And("50 rows are presented, one of them New York", givenRowsPresented);
      And(
        "the user typed {string} in New York, so New York shows a wall-time hint",
        (_ctx, time: string) => {
          state = typeInNewYork(state, time);
          const [newYorkRow] = presentBudgetState(state);
          expect(newYorkRow?.wallTimeHint).toBeDefined();
        },
      );
      When("the rows are presented again", () => {
        workCount = startWorkCount();
        presentBudgetState(state);
        workCount.stop();
      });
      Then("no date or time formatter is built", () =>
        expect(workCount.formatters()).toBe(0),
      );
    },
  );

  // @add-wall-time-input-with-hint @NFR-P1
  f.Scenario(
    "The typed time is resolved in its row's zone only",
    ({ Given, And, When, Then }) => {
      let lookups: ReturnType<typeof startZoneLookupCount>;
      Given("the current instant is {string}", givenInstant);
      And("50 rows are presented, one of them New York", givenRowsPresented);
      When("the user types {string} in New York", (_ctx, time: string) => {
        lookups = startZoneLookupCount();
        state = typeInNewYork(state, time);
        lookups.stop();
      });
      Then(
        "wall-clock time is converted to an instant only in {string}",
        (_ctx, zone: string) => {
          expect(lookups.wallClockLookupsIn(zone)).toBeGreaterThan(0);
          for (const location of state.locations) {
            if (location.timeZoneId === zone) continue;
            expect(lookups.wallClockLookupsIn(location.timeZoneId)).toBe(0);
          }
          expect(lookups.wallClockLookupsIn(state.deviceTimeZoneId)).toBe(0);
        },
      );
    },
  );
});
