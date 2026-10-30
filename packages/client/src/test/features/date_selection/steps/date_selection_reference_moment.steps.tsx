import type { FeatureDescriibeCallbackParams } from "@amiceli/vitest-cucumber";
import { describeFeature, loadFeature } from "@amiceli/vitest-cucumber";
import { expect } from "vitest";
import { Temporal } from "@/lib/temporal";
import { createHomeLocationWorld } from "../../home_location/steps/homeLocationWorld";
import { createReferenceMomentSteps } from "./referenceMomentStepHelpers";

const feature = await loadFeature("../date_selection_reference_moment.feature");

const REPEATED_MOVE_COUNT = 5;
const ONE_DAY = { days: 1 };

describeFeature(feature, (f: FeatureDescriibeCallbackParams) => {
  const home = createHomeLocationWorld();
  const { world } = home;

  f.BeforeEachScenario(async () => {
    await home.reset();
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
    thenNowInactive,
    whenActivatesInactiveNow,
    thenNowActive,
  } = createReferenceMomentSteps(world);

  // @select-date-with-calendar-and-now @FR1 @M2
  // @keep-now-button-visible-when-live @FR1
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
    And("the Now button is inactive", thenNowInactive);
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
  // @keep-now-button-visible-when-live @FR3
  f.Scenario("Now after browsing dates", ({ Given, And, When, Then }) => {
    Given("the device time zone is {string}", givenZone);
    And("the current instant is {string}", givenInstant);
    And("the list contains {string}", givenList);
    And("the app is open", givenAppOpen);
    And("the user moved to the next day", givenMovedToNextDay);
    Then("the Now button is active", thenNowActive);
    When("the user returns to now", () => world.returnToNow());
    Then("the moment is live", thenLive);
    And(
      "the {string} row shows the time {string} and the date {string}",
      thenRowShows,
    );
    And("the Now button is inactive", thenNowInactive);
  });

  // @keep-now-button-visible-when-live @FR2 @M5
  f.Scenario("An inactive Now changes nothing", ({ Given, And, When, Then }) => {
    Given("the device time zone is {string}", givenZone);
    And("the current instant is {string}", givenInstant);
    And("the list contains {string}", givenList);
    And("the app is open", givenAppOpen);
    When("the user activates the inactive Now button", whenActivatesInactiveNow);
    Then("the moment is live", thenLive);
    And(
      "the {string} row shows the time {string} and the date {string}",
      thenRowShows,
    );
    And("the Now button is inactive", thenNowInactive);
  });

  // @set-home-location-and-show-differences @FR4
  f.Scenario(
    "A home change keeps the pinned moment",
    ({ Given, And, When, Then }) => {
      Given("the device time zone is {string}", givenZone);
      And("the list contains {string}", givenList);
      And(
        "the moment is pinned to {string}",
        async (_ctx, timestamp: string) => {
          const dayBefore = Temporal.Instant.from(timestamp)
            .toZonedDateTimeISO("UTC")
            .subtract(ONE_DAY);
          world.setInstant(dayBefore.toInstant().toString());
          await world.openApp();
          await world.showNextDay();
        },
      );
      When("the user makes {string} home", home.steps.whenMakesHome);
      Then("the moment is pinned to {string}", home.steps.thenPinned);
      And("the date bar shows Monday, March 9", () =>
        expect(world.getReference().dateBar.fullDateLabel).toContain(
          "Monday, March 9",
        ),
      );
    },
  );
});
