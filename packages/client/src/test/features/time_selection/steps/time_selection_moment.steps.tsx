import type { FeatureDescriibeCallbackParams } from "@amiceli/vitest-cucumber";
import { describeFeature, loadFeature } from "@amiceli/vitest-cucumber";
import { expect } from "vitest";
import { createTimeSelectionWorld } from "./timeSelectionWorld";
import { createTrackBudgetWorld } from "./trackBudgetWorld";

const feature = await loadFeature("../time_selection_moment.feature");

const PRECISION = 6;
const QUARTER = 0.75;
const SELECTION_COUNT = 20;
const ROW_BUDGET_MS = 50;
describeFeature(feature, (f: FeatureDescriibeCallbackParams) => {
  const world = createTimeSelectionWorld();
  const budget = createTrackBudgetWorld();

  f.BeforeEachScenario(async () => {
    await world.reset();
  });
  f.AfterAllScenarios(world.finish);

  const givenZone = (_ctx: unknown, zone: string) => world.setDeviceZone(zone);
  const givenInstant = (_ctx: unknown, timestamp: string) =>
    world.setInstant(timestamp);
  const givenList = (_ctx: unknown, cities: string) =>
    world.setStoredCities(cities);
  const givenAppOpen = () => world.open();
  const selectQuarter = () => world.selectFraction(QUARTER);
  const thenPinned = (_ctx: unknown, timestamp: string) => {
    expect(world.isNowShown()).toBe(true);
    expect(world.shownInstant()).toBe(timestamp);
  };
  const thenCardShows = (_ctx: unknown, city: string, time: string) =>
    expect(world.rowOf(city).localTimeLabel).toBe(time);
  const thenEveryHandleAt = (_ctx: unknown, fraction: number) => {
    for (const row of world.rows()) {
      expect(row.dayTrack?.fraction).toBeCloseTo(fraction, PRECISION);
    }
  };

  // @add-time-sliders-to-location-cards @FR5
  f.Scenario("Now after selecting a time", ({ Given, And, When, Then }) => {
    Given("the device time zone is {string}", givenZone);
    And("the current instant is {string}", givenInstant);
    And("the list contains {string}", givenList);
    And("the app is open", givenAppOpen);
    When("the user selects three quarters of a track", selectQuarter);
    Then("the Now button is shown", () =>
      expect(world.isNowShown()).toBe(true),
    );
    When("the user returns to now", () => world.returnToNow());
    Then("the moment is live", () => expect(world.isNowShown()).toBe(false));
    And("the {string} card shows {string}", thenCardShows);
    And("every handle stands at {number}", thenEveryHandleAt);
  });

  // @add-time-sliders-to-location-cards @FR5
  f.Scenario(
    "A date change keeps the selected time",
    ({ Given, And, When, Then }) => {
      Given("the device time zone is {string}", givenZone);
      And("the current instant is {string}", givenInstant);
      And("the list contains {string}", givenList);
      And("the app is open", givenAppOpen);
      And("the user selects three quarters of a track", selectQuarter);
      When("the user moves to the next day", () => world.showNextDay());
      Then("the moment is pinned to {string}", thenPinned);
      And("every handle stands at {number}", thenEveryHandleAt);
    },
  );

  // @add-time-sliders-to-location-cards @FR8 @M7
  f.Scenario("Time selections store nothing", ({ Given, And, When, Then }) => {
    Given("the list contains {string}", givenList);
    And("the app is open", givenAppOpen);
    When(
      "the user makes {int} time selections and then returns to now",
      (_ctx, count: number) => {
        expect(count).toBe(SELECTION_COUNT);
        for (let step = 0; step < count; step++) {
          world.selectFraction(step / count);
        }
        world.returnToNow();
      },
    );
    Then("the stored list was not written", () =>
      expect(world.getWriteScheduler().lastDelayMs()).toBeUndefined(),
    );
  });

  // @add-time-sliders-to-location-cards @FR8
  f.Scenario(
    "The selected time survives a list change in another tab",
    ({ Given, And, When, Then }) => {
      Given("the device time zone is {string}", givenZone);
      And("the list contains {string}", givenList);
      And("the app is open", givenAppOpen);
      And("the user selects three quarters of a track", selectQuarter);
      When("another tab adds {string} to the list", (_ctx, city: string) =>
        world.addCityInAnotherTab(city),
      );
      Then("the moment is pinned to {string}", thenPinned);
      And("the {string} card shows {string}", thenCardShows);
    },
  );

  // @add-time-sliders-to-location-cards @NFR-P1
  f.Scenario(
    "50 rows within the time-selection budget",
    ({ Given, When, Then, And }) => {
      Given(
        "50 locations presented at {string} in the device time zone {string}",
        (_ctx, timestamp: string, zone: string) =>
          budget.prepare(timestamp, zone),
      );
      When(
        "a time selection pins {string} and the rows are presented again",
        (_ctx, instant: string) => budget.measureSelection(instant),
      );
      Then("it takes at most 50 ms", () =>
        expect(budget.elapsedMs()).toBeLessThanOrEqual(ROW_BUDGET_MS),
      );
      And("every row's handle stands at {number}", (_ctx, fraction: number) =>
        budget.expectEveryHandleAt(fraction),
      );
    },
  );
});
