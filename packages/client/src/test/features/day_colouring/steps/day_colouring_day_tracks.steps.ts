// Verifies FR2, FR3, FR8, FR9, FR10, FR13, FR15, FR16 of add-day-colouring-setting.
import type { FeatureDescriibeCallbackParams } from "@amiceli/vitest-cucumber";
import { describeFeature, loadFeature } from "@amiceli/vitest-cucumber";
import { expect } from "vitest";
import { Temporal } from "@/lib/temporal";
import { isWorkingTime } from "@/model";
import { DayColouring, DEFAULT_WORKING_HOURS } from "@/preferences";
import { KNOWN_CITIES } from "@/test/factories/buildLocation";
import { createTimeSelectionWorld } from "../../time_selection/steps/timeSelectionWorld";
import { expectColourStops, parseWorkingHoursText } from "./dayColouringChecks";

const feature = await loadFeature("../day_colouring_day_tracks.feature");

describeFeature(feature, (f: FeatureDescriibeCallbackParams) => {
  const world = createTimeSelectionWorld();
  let workingHours = DEFAULT_WORKING_HOURS;
  let readInstant = "";
  let readCity = "";

  f.BeforeEachScenario(async () => {
    await world.reset();
    workingHours = DEFAULT_WORKING_HOURS;
  });
  f.AfterAllScenarios(world.finish);

  const givenZone = (_ctx: unknown, zone: string) => world.setDeviceZone(zone);
  const givenInstant = (_ctx: unknown, timestamp: string) =>
    world.setInstant(timestamp);
  const givenList = (_ctx: unknown, cities: string) =>
    world.setStoredCities(cities);
  const givenAppOpen = () => world.open();
  const expectStops = (_ctx: unknown, city: string, stops: string) =>
    expectColourStops(world, city, stops);
  const stripQuotes = (text: string) => text.split('"').join("");

  // @add-day-colouring-setting @FR2
  f.Scenario("Time of day by default", ({ Given, And, When, Then }) => {
    Given("the device time zone is {string}", givenZone);
    And("the current instant is {string}", givenInstant);
    And("the list contains {string}", givenList);
    When("the user opens the app", givenAppOpen);
    Then("the colour stops of {string} are {string}", expectStops);
    And("the colour stops of {string} are {string}", expectStops);
  });

  // @add-day-colouring-setting @FR3 @FR9
  f.Scenario(
    "Changing the colouring keeps the moment",
    ({ Given, And, When, Then }) => {
      Given("the device time zone is {string}", givenZone);
      And("the current instant is {string}", givenInstant);
      And("the list contains {string}", givenList);
      And("the app is open", givenAppOpen);
      And("the moment is pinned to {string}", (_ctx, timestamp: string) => {
        world.selectFraction(world.trackOf("Almaty").fraction);
        expect(world.isNowActive()).toBe(true);
        expect(world.shownInstant()).toBe(timestamp);
      });
      When("the user chooses the Plain colouring", () =>
        world.chooseDayColouring(DayColouring.PLAIN),
      );
      Then(
        "the moment is still pinned to {string}",
        (_ctx, timestamp: string) => {
          expect(world.isNowActive()).toBe(true);
          expect(world.shownInstant()).toBe(timestamp);
        },
      );
      And("the colour stops of {string} are {string}", expectStops);
    },
  );

  // @add-day-colouring-setting @FR9
  f.Scenario("A plain track", ({ Given, And, When, Then }) => {
    Given("the day colouring is Plain", () =>
      world.setDayColouring(DayColouring.PLAIN),
    );
    And("the device time zone is {string}", givenZone);
    And("the current instant is {string}", givenInstant);
    And("the list contains {string}", givenList);
    When("the user opens the app", givenAppOpen);
    Then("the colour stops of {string} are {string}", expectStops);
    And("the colour stops of {string} are {string}", expectStops);
  });

  // @add-day-colouring-setting @FR8 @FR10
  f.ScenarioOutline(
    "Each location reads the working hours in its own time",
    ({ Given, When, Then }, variables) => {
      Given("the working hours are 10:00-18:00", () => {
        workingHours = parseWorkingHoursText("10:00-18:00");
      });
      When("working time is read for <city> at <instant>", () => {
        readCity = variables.city;
        readInstant = variables.instant;
      });
      Then("it is <working>", () => {
        expect(
          isWorkingTime(
            Temporal.Instant.from(readInstant),
            KNOWN_CITIES[readCity].timeZoneId,
            workingHours,
          ),
        ).toBe(variables.working === "working time");
      });
    },
  );

  // @add-day-colouring-setting @FR8
  f.Scenario("Weekends are never working time", ({ Given, When, Then }) => {
    Given("the working hours are 10:00-18:00", () => {
      workingHours = parseWorkingHoursText("10:00-18:00");
    });
    When("working time is read for Moscow at 2026-03-14T09:00:00Z", () => {
      readCity = "Moscow";
      readInstant = "2026-03-14T09:00:00Z";
    });
    Then("it is not working time", () => {
      expect(
        isWorkingTime(
          Temporal.Instant.from(readInstant),
          KNOWN_CITIES[readCity].timeZoneId,
          workingHours,
        ),
      ).toBe(false);
    });
  });

  // @add-day-colouring-setting @FR8 @FR13
  f.ScenarioOutline(
    "Working-time stops on a Monday",
    ({ Given, And, When, Then }, variables) => {
      Given("the day colouring is Working hours with <hours>", () =>
        world.setDayColouring(
          DayColouring.WORKING_HOURS,
          parseWorkingHoursText(variables.hours),
        ),
      );
      And("the device time zone is {string}", givenZone);
      And("the current instant is {string}", givenInstant);
      And("the list contains {string}", givenList);
      When("the user opens the app", givenAppOpen);
      Then("the colour stops of <city> are <stops>", () =>
        expectColourStops(world, stripQuotes(variables.city), variables.stops),
      );
    },
  );

  // @add-day-colouring-setting @FR8 @FR15
  f.Scenario(
    "Friday still works where Saturday has not begun",
    ({ Given, And, When, Then }) => {
      Given("the day colouring is Working hours with 10:00-18:00", () =>
        world.setDayColouring(
          DayColouring.WORKING_HOURS,
          parseWorkingHoursText("10:00-18:00"),
        ),
      );
      And("the device time zone is {string}", givenZone);
      And("the current instant is {string}", givenInstant);
      And("the list contains {string}", givenList);
      When("the user opens the app", givenAppOpen);
      Then("the colour stops of {string} are {string}", expectStops);
      And("the colour stops of {string} are {string}", expectStops);
    },
  );

  // @add-day-colouring-setting @FR8 @FR16
  f.Scenario(
    "Working time after a clock change",
    ({ Given, And, When, Then }) => {
      Given("the day colouring is Working hours with 10:00-18:00", () =>
        world.setDayColouring(
          DayColouring.WORKING_HOURS,
          parseWorkingHoursText("10:00-18:00"),
        ),
      );
      And("the device time zone is {string}", givenZone);
      And("the current instant is {string}", givenInstant);
      And("the list contains {string}", givenList);
      When("the user opens the app", givenAppOpen);
      Then("the colour stops of {string} are {string}", expectStops);
    },
  );
});
