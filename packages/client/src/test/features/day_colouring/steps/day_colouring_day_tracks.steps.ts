// Verifies FR2, FR3, FR8, FR9, FR10 of add-day-colouring-setting.
// Verifies FR5, FR7, FR8, UX4 of bind-day-periods-to-sun.
import type { FeatureDescriibeCallbackParams } from "@amiceli/vitest-cucumber";
import { describeFeature, loadFeature } from "@amiceli/vitest-cucumber";
import { expect } from "vitest";
import { Temporal } from "@/lib/temporal";
import { getDayPeriodStops, isWorkingTime } from "@/model";
import { DayColouring, DEFAULT_WORKING_HOURS } from "@/preferences";
import { DayColour } from "@/presenter";
import { KNOWN_CITIES } from "@/test/factories/buildLocation";
import { createTimeSelectionWorld } from "../../time_selection/steps/timeSelectionWorld";
import { expectColourStops, parseWorkingHoursText } from "./dayColouringChecks";

const feature = await loadFeature("../day_colouring_day_tracks.feature");

const KAZAN_COORDINATES = { latitude: 55.8, longitude: 49.1 };

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

  // @add-day-colouring-setting @FR8 @FR10
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

  // @add-day-colouring-setting @FR8 @FR10
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

  // @add-day-colouring-setting @FR8 @FR10
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
  const dayColouringFor = (colouring: string) =>
    colouring === "Plain" ? DayColouring.PLAIN : DayColouring.WORKING_HOURS;

  // @bind-day-periods-to-sun @FR8 @UX4
  f.Scenario(
    "UTC in the Time of day colouring",
    ({ Given, And, When, Then }) => {
      Given("the day colouring is Time of day", () =>
        world.setDayColouring(DayColouring.TIME_OF_DAY),
      );
      And("the device time zone is {string}", givenZone);
      And("the current instant is {string}", givenInstant);
      And("the list contains {string}", givenList);
      When("the user opens the app", givenAppOpen);
      Then("the colour stops of {string} are {string}", expectStops);
    },
  );

  // @bind-day-periods-to-sun @FR8
  f.ScenarioOutline(
    "UTC in the other colourings",
    ({ Given, And, When, Then }, variables) => {
      Given("the day colouring is <colouring> with 10:00-18:00", () =>
        world.setDayColouring(
          dayColouringFor(variables.colouring),
          parseWorkingHoursText("10:00-18:00"),
        ),
      );
      And("the device time zone is {string}", givenZone);
      And("the current instant is {string}", givenInstant);
      And("the list contains {string}", givenList);
      When("the user opens the app", givenAppOpen);
      Then("UTC is coloured <how>", () => {
        const colours = world.trackOf("UTC").stops.map((stop) => stop.colour);
        if (variables.colouring === "Plain") {
          expect(colours).toEqual([DayColour.PLAIN]);
        } else {
          expect(colours).toContain(DayColour.WORKING_TIME);
          expect(colours).not.toContain(DayColour.NO_DAY_PERIOD);
        }
      });
    },
  );

  // @bind-day-periods-to-sun @FR7 @FR8
  f.Scenario("A location gains coordinates", ({ Given, And, When, Then }) => {
    Given("the day colouring is Time of day", () =>
      world.setDayColouring(DayColouring.TIME_OF_DAY),
    );
    And("the device time zone is {string}", givenZone);
    And("the current instant is {string}", givenInstant);
    And("the list contains {string}", givenList);
    And("the app is open", givenAppOpen);
    When("the location gains the coordinates 55.8, 49.1", () => {
      expect(world.trackOf("Nowhere").stops).toEqual([
        { fraction: 0, colour: DayColour.NO_DAY_PERIOD },
      ]);
      world.saveListInAnotherTab((location) => ({
        ...location,
        coordinates: KAZAN_COORDINATES,
      }));
    });
    Then(
      "the track of {string} is coloured by the day periods of 55.8, 49.1 without a reload",
      (_ctx, city: string) => {
        const day = world.dayBoundsOf(city);
        const expected = (
          getDayPeriodStops(KAZAN_COORDINATES, {
            ...day,
            clockChangeWindow: { start: day.start, end: day.start },
          }) ?? []
        ).map((stop) => stop.fraction);
        expect(world.trackOf(city).stops.map((stop) => stop.fraction)).toEqual(
          expected,
        );
      },
    );
  });
});
