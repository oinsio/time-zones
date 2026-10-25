import type { FeatureDescriibeCallbackParams } from "@amiceli/vitest-cucumber";
import { describeFeature, loadFeature } from "@amiceli/vitest-cucumber";
import { act } from "@testing-library/react/pure";
import { expect } from "vitest";
import { Temporal } from "@/lib/temporal";
import { buildLocation } from "@/test/factories/buildLocation";
import { setPageVisibility } from "@/test/pageVisibility";
import { createDateSelectionWorld } from "./dateSelectionWorld";

const feature = await loadFeature("../date_selection_reference_moment.feature");

const ROW_BUDGET_MS = 50;
const BUDGET_ROW_COUNT = 50;
const REPEATED_MOVE_COUNT = 5;

describeFeature(feature, (f: FeatureDescriibeCallbackParams) => {
  const world = createDateSelectionWorld();
  let elapsedMs = 0;
  let budgetZone = "";

  f.BeforeEachScenario(async () => {
    await world.reset();
  });
  f.AfterAllScenarios(world.finish);

  const givenZone = (_ctx: unknown, zone: string) => world.setDeviceZone(zone);
  const givenInstant = (_ctx: unknown, timestamp: string) =>
    world.setInstant(timestamp);
  const givenList = (_ctx: unknown, cities: string) =>
    world.setStoredCities(cities);
  const givenAppOpen = () => world.openApp();
  const givenMovedToNextDay = () => world.showNextDay();
  const whenOpens = () => world.openApp();
  const whenNextDay = () => world.showNextDay();
  const whenPreviousDay = () => world.showPreviousDay();
  const thenLive = () => world.expectLive();
  const thenPinned = (_ctx: unknown, timestamp: string) =>
    world.expectPinnedTo(timestamp);
  const thenRowShows = (
    _ctx: unknown,
    city: string,
    time: string,
    date: string,
  ) => world.expectRowShows(city, time, date);
  const thenRowsShow = (
    _ctx: unknown,
    table: { city: string; time: string; date: string }[],
  ) => {
    for (const { city, time, date } of table) {
      world.expectRowShows(city, time, date);
    }
  };
  const thenOffset = (_ctx: unknown, city: string, offset: string) =>
    world.expectRowOffset(city, offset);
  const thenNowNotShown = () => expect(world.isNowShown()).toBe(false);
  const thenNowShown = () => expect(world.isNowShown()).toBe(true);
  const whenNextMinute = async (_ctx: unknown, timestamp: string) => {
    world.setInstant(timestamp);
    await world.runTick();
  };

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

  // @select-date-with-calendar-and-now @NFR-P1
  f.Scenario("50 rows within the budget", ({ Given, And, When, Then }) => {
    Given("50 locations", () => {
      const zones = Intl.supportedValuesOf("timeZone").slice(
        0,
        BUDGET_ROW_COUNT,
      );
      budgetZone = zones[0] ?? "";
      world.setStoredLocations(
        zones.map((zone) => buildLocation({ timeZoneId: zone, label: zone })),
      );
    });
    And("the app is open", givenAppOpen);
    When("the user moves to the next day", () => {
      const startedAt = performance.now();
      act(() => world.getReference().showNextDay());
      elapsedMs = performance.now() - startedAt;
    });
    Then("the rows show the new date within 50 ms", () => {
      const expectedDate = Temporal.Instant.from("2026-03-09T00:00:00Z")
        .toZonedDateTimeISO(budgetZone)
        .toPlainDate()
        .toString();
      expect(world.rowOf(budgetZone).querySelector("time")).toHaveAttribute(
        "datetime",
        expectedDate,
      );
      expect(elapsedMs).toBeLessThanOrEqual(ROW_BUDGET_MS);
    });
  });

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
