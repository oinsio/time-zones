import type { FeatureDescriibeCallbackParams } from "@amiceli/vitest-cucumber";
import { describeFeature, loadFeature } from "@amiceli/vitest-cucumber";
import { expect } from "vitest";
import { createDateSelectionWorld } from "./dateSelectionWorld";
import { createReferenceMomentSteps } from "./referenceMomentStepHelpers";

const feature = await loadFeature("../date_selection_reference_moment.feature");

const REPEATED_MOVE_COUNT = 5;

describeFeature(feature, (f: FeatureDescriibeCallbackParams) => {
  const world = createDateSelectionWorld();

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
    whenOpens,
    whenNextDay,
    whenPreviousDay,
    thenLive,
    thenPinned,
    thenRowShows,
    thenRowsShow,
    thenOffset,
    thenNowNotShown,
    thenNowShown,
  } = createReferenceMomentSteps(world);

  // @select-date-with-calendar-and-now @FR1 @M2
  f.Scenario("The app opens live", ({ Given, And, When, Then }) => {
    Given("the device time zone is {string}", givenZone);
    And("the current instant is {string}", givenInstant);
    And("the list contains {string}", givenList);
    When("the user opens the app", whenOpens);
    Then("the moment is live", thenLive);
    And(
      "the {string} row shows the time {string} and the date {string}",
      thenRowShows,
    );
    And("the Now button is not shown", thenNowNotShown);
  });

  // @select-date-with-calendar-and-now @FR1 @M5
  f.Scenario("Date changes store nothing", ({ Given, And, When, Then }) => {
    Given("the list contains {string}", givenList);
    And("the app is open", givenAppOpen);
    When(
      "the user moves to the next day 5 times, to the previous day 5 times and then returns to now",
      async () => {
        for (let move = 0; move < REPEATED_MOVE_COUNT; move++) {
          await world.showNextDay();
        }
        for (let move = 0; move < REPEATED_MOVE_COUNT; move++) {
          await world.showPreviousDay();
        }
        await world.returnToNow();
      },
    );
    Then("the stored list was not written", () =>
      expect(world.getWriteScheduler().lastDelayMs()).toBeUndefined(),
    );
  });

  // @select-date-with-calendar-and-now @FR1
  f.Scenario(
    "The pinned moment survives a list change in another tab",
    ({ Given, And, When, Then }) => {
      Given("the device time zone is {string}", givenZone);
      And("the current instant is {string}", givenInstant);
      And("the list contains {string}", givenList);
      And("the app is open", givenAppOpen);
      And("the user moved to the next day", givenMovedToNextDay);
      When("another tab adds {string}", (_ctx, city: string) =>
        world.addCityInAnotherTab(city),
      );
      Then("the moment is pinned to {string}", thenPinned);
      And(
        "the {string} row shows the time {string} and the date {string}",
        thenRowShows,
      );
    },
  );

  // @select-date-with-calendar-and-now @FR2 @FR5 @M2
  f.Scenario("Next day from live", ({ Given, And, When, Then }) => {
    Given("the device time zone is {string}", givenZone);
    And("the current instant is {string}", givenInstant);
    And("the list contains {string}", givenList);
    And("the app is open", givenAppOpen);
    When("the user moves to the next day", whenNextDay);
    Then("the moment is pinned to {string}", thenPinned);
    And("the rows show:", thenRowsShow);
    And("the {string} row shows the offset {string}", thenOffset);
  });

  // @select-date-with-calendar-and-now @FR2 @FR5 @M2
  f.Scenario(
    "Previous day resolves the offset for that day",
    ({ Given, And, When, Then }) => {
      Given("the device time zone is {string}", givenZone);
      And("the current instant is {string}", givenInstant);
      And("the list contains {string}", givenList);
      And("the app is open", givenAppOpen);
      When("the user moves to the previous day", whenPreviousDay);
      Then("the moment is pinned to {string}", thenPinned);
      And(
        "the {string} row shows the time {string} and the date {string}",
        thenRowShows,
      );
      And("the {string} row shows the offset {string}", thenOffset);
    },
  );

  // @select-date-with-calendar-and-now @FR2
  f.Scenario(
    "Moves add up from the pinned moment",
    ({ Given, And, When, Then }) => {
      Given("the device time zone is {string}", givenZone);
      And("the current instant is {string}", givenInstant);
      And("the app is open", givenAppOpen);
      When(
        "the user moves to the next day twice and to the previous day once",
        async () => {
          await world.showNextDay();
          await world.showNextDay();
          await world.showPreviousDay();
        },
      );
      Then("the moment is pinned to {string}", thenPinned);
    },
  );

  // @select-date-with-calendar-and-now @FR6 @M2
  f.Scenario("Now after browsing dates", ({ Given, And, When, Then }) => {
    Given("the device time zone is {string}", givenZone);
    And("the current instant is {string}", givenInstant);
    And("the list contains {string}", givenList);
    And("the app is open", givenAppOpen);
    And("the user moved to the next day", givenMovedToNextDay);
    Then("the Now button is shown", thenNowShown);
    When("the user returns to now", () => world.returnToNow());
    Then("the moment is live", thenLive);
    And(
      "the {string} row shows the time {string} and the date {string}",
      thenRowShows,
    );
    And("the Now button is not shown", thenNowNotShown);
  });
});
