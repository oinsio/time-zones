import type { FeatureDescriibeCallbackParams } from "@amiceli/vitest-cucumber";
import { describeFeature, loadFeature } from "@amiceli/vitest-cucumber";
import { expect } from "vitest";
import { TRACK_STEP_MINUTES } from "@/constants";
import { buildLocation } from "@/test/factories/buildLocation";
import { cityEntry } from "../../locations/steps/locationsUiWorld";
import { createTimeSelectionWorld } from "./timeSelectionWorld";
import { createTrackBudgetWorld } from "./trackBudgetWorld";

const feature = await loadFeature("../time_selection_day_track.feature");

const PRECISION = 6;
const ROW_BUDGET_MS = 50;
const UNKNOWN_ZONE_LABEL = "Olympus Mons";

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
  const givenPinnedHere = () =>
    world.selectFraction(world.rows()[0]?.dayTrack?.fraction ?? 0);
  const whenNextMinute = (_ctx: unknown, timestamp: string) => {
    world.clock().moveTo(timestamp);
    world.runTick();
  };
  const thenEveryHandleAt = (_ctx: unknown, fraction: number) => {
    for (const row of world.rows()) {
      expect(row.dayTrack?.fraction).toBeCloseTo(fraction, PRECISION);
    }
  };

  // @add-time-sliders-to-location-cards @FR1
  f.Scenario("A 24-hour reference day", ({ Given, And, When, Then }) => {
    Given("the device time zone is {string}", givenZone);
    And("the current instant is {string}", givenInstant);
    And("the list contains {string}", givenList);
    When("the user opens the app", givenAppOpen);
    Then(
      "every card shows a track for the day from {string} to {string}",
      (_ctx, start: string, end: string) => {
        for (const row of world.rows()) {
          const day = world.dayBoundsOf(row.cityLabel);
          expect([day.start.toString(), day.end.toString()]).toEqual([
            start,
            end,
          ]);
        }
      },
    );
  });

  // @add-time-sliders-to-location-cards @FR1 @M4
  f.ScenarioOutline(
    "Days of 23 and 25 hours",
    ({ Given, And, When, Then }, variables) => {
      Given("the device time zone is {string}", givenZone);
      And("the list contains {string}", givenList);
      When("the moment is on <date> in New York", () => {
        world.setInstant(`${variables.date}T17:00:00Z`);
        world.open();
      });
      Then("the reference day is <minutes> minutes long", () => {
        const track = world.trackOf("New York");
        expect(track.maxMinutes + TRACK_STEP_MINUTES).toBe(
          Number(variables.minutes),
        );
      });
    },
  );

  // @add-time-sliders-to-location-cards @FR1
  f.Scenario("No track for an unknown zone", ({ Given, When, Then, And }) => {
    Given(
      "the list holds Moscow and a location whose zone the browser does not know",
      () =>
        world.setStoredLocations([
          buildLocation(cityEntry("Moscow")),
          buildLocation({
            label: UNKNOWN_ZONE_LABEL,
            timeZoneId: "Mars/Olympus_Mons",
            countryCode: "",
          }),
        ]),
    );
    When("the list is presented", givenAppOpen);
    Then("that location's card shows no track", () =>
      expect(world.rowOf(UNKNOWN_ZONE_LABEL).dayTrack).toBeUndefined(),
    );
    And("the Moscow card shows its track", () =>
      expect(world.rowOf("Moscow").dayTrack).toBeDefined(),
    );
  });

  // @add-time-sliders-to-location-cards @FR2 @M2
  f.Scenario(
    "All handles stand at the same position",
    ({ Given, And, When, Then }) => {
      Given("the device time zone is {string}", givenZone);
      And("the current instant is {string}", givenInstant);
      And("the list contains {string}", givenList);
      When("the user opens the app", givenAppOpen);
      Then("every handle stands at {number}", thenEveryHandleAt);
    },
  );

  // @add-time-sliders-to-location-cards @FR2
  f.Scenario(
    "A live handle follows the clock",
    ({ Given, And, When, Then }) => {
      Given("the device time zone is {string}", givenZone);
      And("the current instant is {string}", givenInstant);
      And("the list contains {string}", givenList);
      And("the app is open", givenAppOpen);
      When("the next minute starts at {string}", whenNextMinute);
      Then("every handle stands at {number}", thenEveryHandleAt);
    },
  );

  // @add-time-sliders-to-location-cards @FR2
  f.Scenario(
    "A pinned handle ignores minute updates",
    ({ Given, And, When, Then }) => {
      Given("the device time zone is {string}", givenZone);
      And("the current instant is {string}", givenInstant);
      And("the list contains {string}", givenList);
      And("the app is open", givenAppOpen);
      And("the moment is pinned at its current position", givenPinnedHere);
      When("the next minute starts at {string}", whenNextMinute);
      Then("every handle stands at {number}", thenEveryHandleAt);
    },
  );

  // @add-time-sliders-to-location-cards @NFR-P2
  f.Scenario(
    "50 tracks within the date-change budget",
    ({ Given, When, Then, And }) => {
      Given(
        "50 locations presented at {string} in the device time zone {string}",
        (_ctx, timestamp: string, zone: string) =>
          budget.prepare(timestamp, zone),
      );
      When(
        "the date moves to the next day and the rows are presented again",
        budget.measureDateChange,
      );
      Then("it takes at most 50 ms", () =>
        expect(budget.elapsedMs()).toBeLessThanOrEqual(ROW_BUDGET_MS),
      );
      And(
        "every row carries colour stops and hour labels for the day starting {string}",
        (_ctx, dayStart: string) =>
          budget.expectEveryTrackForDayStarting(dayStart),
      );
    },
  );
});
