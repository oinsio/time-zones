import type { FeatureDescriibeCallbackParams } from "@amiceli/vitest-cucumber";
import { describeFeature, loadFeature } from "@amiceli/vitest-cucumber";
import { act } from "@testing-library/react/pure";
import { expect } from "vitest";
import { buildLocation } from "@/test/factories/buildLocation";
import { setPageVisibility } from "@/test/pageVisibility";
import { createDateSelectionWorld } from "./dateSelectionWorld";
import {
  createRowBudgetWorld,
  expectRowsShowDateAt,
  firstZones,
} from "./referenceMomentRowsWorld";
import { createReferenceMomentSteps } from "./referenceMomentStepHelpers";

const feature = await loadFeature(
  "../date_selection_reference_moment_rows.feature",
);

const ROW_BUDGET_MS = 50;
const SAME_RENDER_INSTANT = "2026-03-09T07:30:00Z";
describeFeature(feature, (f: FeatureDescriibeCallbackParams) => {
  const world = createDateSelectionWorld();
  const budget = createRowBudgetWorld();

  f.BeforeEachScenario(async () => {
    await world.reset();
  });
  f.AfterAllScenarios(world.finish);

  const {
    givenZone,
    givenInstant,
    givenList,
    givenAppOpen,
    givenMovedToNextDay,
    whenPreviousDay,
    thenRowShows,
    thenRowsShow,
    whenNextMinute,
  } = createReferenceMomentSteps(world);

  // @select-date-with-calendar-and-now @fix-date-change-row-budget-measurement @NFR-P1
  f.Scenario("50 rows within the budget", ({ Given, When, Then, And }) => {
    Given(
      "50 locations presented at {string} in the device time zone {string}",
      (_ctx, timestamp: string, zone: string) =>
        budget.prepare(timestamp, zone),
    );
    When(
      "the date moves to the next day and the rows are presented again",
      budget.measureDateChange,
    );
    Then("it takes at most 50 ms", () => {
      expect(budget.elapsedMs()).toBeLessThanOrEqual(ROW_BUDGET_MS);
    });
    And(
      "every row carries its local date at {string}",
      (_ctx, timestamp: string) => budget.expectRowsCarryDateAt(timestamp),
    );
  });

  // @fix-date-change-row-budget-measurement @FR1 @UX1
  f.Scenario(
    "The new date shows in the same render",
    ({ Given, And, When, Then }) => {
      Given("50 locations", () => {
        world.setStoredLocations(
          firstZones().map((zone) =>
            buildLocation({ timeZoneId: zone, label: zone }),
          ),
        );
      });
      And("the app is open", givenAppOpen);
      When("the user moves to the next day", () => {
        act(() => world.getReference().showNextDay());
      });
      Then("the rows show the new date at once", () => {
        expectRowsShowDateAt(SAME_RENDER_INSTANT, firstZones());
      });
    },
  );

  // @select-date-with-calendar-and-now @FR5
  f.Scenario("Rows at a pinned moment", ({ Given, And, When, Then }) => {
    Given("the device time zone is {string}", givenZone);
    And("the current instant is {string}", givenInstant);
    And("the list contains {string}", givenList);
    And("the app is open", givenAppOpen);
    When("the user moves to the previous day", whenPreviousDay);
    Then("the rows show:", thenRowsShow);
  });

  // @select-date-with-calendar-and-now @FR5
  f.Scenario(
    "A pinned moment ignores minute updates",
    ({ Given, And, When, Then }) => {
      Given("the device time zone is {string}", givenZone);
      And("the current instant is {string}", givenInstant);
      And("the list contains {string}", givenList);
      And("the app is open", givenAppOpen);
      And("the user moved to the next day", givenMovedToNextDay);
      When("the next minute starts at {string}", whenNextMinute);
      Then(
        "the {string} row shows the time {string} and the date {string}",
        thenRowShows,
      );
      When(
        "the page becomes hidden and visible again at {string}",
        (_ctx, timestamp: string) => {
          act(() => setPageVisibility("hidden"));
          world.setInstant(timestamp);
          act(() => setPageVisibility("visible"));
        },
      );
      Then(
        "the {string} row still shows the time {string} and the date {string}",
        thenRowShows,
      );
    },
  );

  // @select-date-with-calendar-and-now @FR6
  f.Scenario(
    "Rows follow the clock again after now",
    ({ Given, And, When, Then }) => {
      Given("the device time zone is {string}", givenZone);
      And("the current instant is {string}", givenInstant);
      And("the list contains {string}", givenList);
      And("the app is open", givenAppOpen);
      And("the user moved to the next day", givenMovedToNextDay);
      When(
        "the current instant is {string} and the user returns to now",
        async (_ctx, timestamp: string) => {
          world.setInstant(timestamp);
          await world.returnToNow();
        },
      );
      Then(
        "the {string} row shows the time {string} and the date {string}",
        thenRowShows,
      );
      When("the next minute starts at {string}", whenNextMinute);
      Then(
        "the {string} row now shows the time {string} and the date {string}",
        thenRowShows,
      );
    },
  );
});
