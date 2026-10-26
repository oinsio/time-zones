import type { FeatureDescriibeCallbackParams } from "@amiceli/vitest-cucumber";
import { describeFeature, loadFeature } from "@amiceli/vitest-cucumber";
import { expect } from "vitest";
import { ONE_DAY, TRACK_STEP_MINUTES } from "@/constants";
import { Temporal } from "@/lib/temporal";
import { buildLocation } from "@/test/factories/buildLocation";
import { MAX_TRANSITION_LOOKUPS_PER_ZONE } from "@/test/workCounters";
import { cityEntry } from "../../locations/steps/locationsUiWorld";
import { createTimeSelectionWorld } from "./timeSelectionWorld";
import { createTrackBudgetWorld } from "./trackBudgetWorld";
import { createTrackLabelsCheck } from "./trackLabelsCheck";

const feature = await loadFeature("../time_selection_day_track.feature");

const PRECISION = 6;
const BUDGET_DEVICE_TIME_ZONE = "UTC";
const UNKNOWN_ZONE_LABEL = "Olympus Mons";

describeFeature(feature, (f: FeatureDescriibeCallbackParams) => {
  const world = createTimeSelectionWorld();
  const budget = createTrackBudgetWorld();
  const labelsCheck = createTrackLabelsCheck();

  f.BeforeEachScenario(async () => {
    await world.reset();
  });
  f.AfterEachScenario(budget.stop);
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
  // @replace-wall-clock-row-budgets-with-deterministic-checks @FR3 @NFR-P1
  f.Scenario(
    "50 tracks within the date-change budget",
    ({ Given, When, Then, And }) => {
      Given(
        "50 locations whose rows have been presented at {string} with the device time zone {string}",
        (_ctx, timestamp: string, zone: string) =>
          budget.prepare(timestamp, zone),
      );
      When(
        "the date moves to the next day and the rows are presented again",
        budget.measureDateChange,
      );
      Then("no date, time or region name formatter is built", () => {
        expect(budget.workCount()?.formatters()).toBe(0);
        expect(budget.workCount()?.displayNames()).toBe(0);
      });
      And(
        "at most {int} time zone transitions are looked up per zone",
        (_ctx, maxLookups: number) => {
          expect(maxLookups).toBe(MAX_TRANSITION_LOOKUPS_PER_ZONE);
          const lookupsByZone = budget.workCount()?.transitionLookupsByZone();
          expect(lookupsByZone?.size).toBeGreaterThan(0);
          for (const lookups of lookupsByZone?.values() ?? []) {
            expect(lookups).toBeLessThanOrEqual(maxLookups);
          }
        },
      );
      And(
        "every row carries colour stops and hour labels for the day starting {string}",
        (_ctx, dayStart: string) =>
          budget.expectEveryTrackForDayStarting(dayStart),
      );
    },
  );

  // @replace-wall-clock-row-budgets-with-deterministic-checks @FR3 @NFR-P1
  f.Scenario(
    "The new day's tracks are computed once",
    ({ Given, When, Then }) => {
      Given(
        "50 locations whose rows have been presented for the day starting {string}",
        async (_ctx, dayStart: string) => {
          const previousMoment = Temporal.Instant.from(dayStart)
            .toZonedDateTimeISO(BUDGET_DEVICE_TIME_ZONE)
            .subtract({ days: ONE_DAY })
            .toInstant()
            .toString();
          await budget.prepare(previousMoment, BUDGET_DEVICE_TIME_ZONE);
          budget.measureDateChange();
          budget.expectEveryTrackForDayStarting(dayStart);
        },
      );
      When("their rows are presented again for that day", budget.presentAgain);
      Then("no time zone transition is looked up", () => {
        expect(budget.workCount()?.transitionLookups()).toBe(0);
      });
    },
  );

  // @replace-wall-clock-row-budgets-with-deterministic-checks @FR5 @UX1
  f.Scenario(
    "Hour labels are unchanged by formatter reuse",
    ({ Given, When, Then }) => {
      Given("the list contains Kolkata, Kathmandu and New York", () => {});
      When(
        "their tracks are presented for the day starting {string} in English and then in Russian",
        (_ctx, dayStart: string) => labelsCheck.presentDay(dayStart),
      );
      Then(
        "each track shows the same hour labels as the platform's own date formatting gives for that zone, with the hour label's format, in the same language, without the shared formatters",
        labelsCheck.expectPlatformLabels,
      );
    },
  );
});
