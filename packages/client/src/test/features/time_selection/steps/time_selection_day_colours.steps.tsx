import type { FeatureDescriibeCallbackParams } from "@amiceli/vitest-cucumber";
import { describeFeature, loadFeature } from "@amiceli/vitest-cucumber";
import i18n from "i18next";
import { expect } from "vitest";
import { assembleDayPeriodStops, DayPeriod, type DayPeriodStop } from "@/model";
import {
  expectLabels,
  expectPeriodColoursOutsideBlends,
  expectStops,
} from "./dayColourChecks";
import { createTimeSelectionWorld } from "./timeSelectionWorld";

const feature = await loadFeature("../time_selection_day_colours.feature");

const HARD_EDGE_FRACTION = 0.5;

describeFeature(feature, (f: FeatureDescriibeCallbackParams) => {
  const world = createTimeSelectionWorld();
  let hardEdgeStops: DayPeriodStop[] = [];

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
  const expectCityStops = (city: string, stopsText: string) =>
    expectStops(world, city, stopsText);
  const expectCityLabels = (city: string, labelsText: string) =>
    expectLabels(world, city, labelsText);

  // @add-time-sliders-to-location-cards @FR6 @M5
  f.ScenarioOutline(
    "Colour stops of Almaty and New York",
    ({ Given, And, When, Then }, variables) => {
      Given("the device time zone is {string}", givenZone);
      And("the current instant is {string}", givenInstant);
      And("the list contains {string}", givenList);
      When("the user opens the app", givenAppOpen);
      Then("the colour stops of <city> are <stops>", () =>
        expectCityStops(variables.city, variables.stops),
      );
    },
  );

  // @add-time-sliders-to-location-cards @FR6 @M5
  f.Scenario(
    "Colours follow the local period outside blend windows",
    ({ Given, And, When, Then }) => {
      Given("the device time zone is {string}", givenZone);
      And("the current instant is {string}", givenInstant);
      And("the list contains {string}", givenList);
      And("the app is open", givenAppOpen);
      When(
        "the colour of the tracks is read at each quarter-hour position outside a blend window",
        () => undefined,
      );
      Then(
        "it is the colour of the period of that location's local time at that instant",
        () => {
          expect(expectPeriodColoursOutsideBlends(world)).toBeGreaterThan(0);
        },
      );
    },
  );

  // @add-time-sliders-to-location-cards @FR6
  f.Scenario(
    "Boundaries of a skipped local date are left out",
    ({ Given, And, When, Then }) => {
      Given("the device time zone is {string}", givenZone);
      And("the current instant is {string}", givenInstant);
      And("the list contains {string}", givenList);
      And("the app is open", givenAppOpen);
      And("the moment is pinned at its current position", givenPinnedHere);
      When("the track of Apia is presented", () =>
        expect(world.trackOf("Apia")).toBeDefined(),
      );
      Then(
        "the colour stops of {string} are {string}",
        (_ctx, city: string, stops: string) => expectCityStops(city, stops),
      );
    },
  );

  // @add-time-sliders-to-location-cards @FR6
  f.Scenario(
    "A period change across an offset change is a hard edge",
    ({ Given, And, When, Then }) => {
      let edgeInstantMinutes = 0;
      const dayLengthMinutes = 1440;
      Given(
        "an offset change inside the reference day at the position {number}",
        (_ctx, position: number) => {
          edgeInstantMinutes = position * dayLengthMinutes;
          expect(position).toBe(HARD_EDGE_FRACTION);
        },
      );
      And(
        "the local time is in the evening just before it and in the night just after it",
        () => undefined,
      );
      When("the colour stops are assembled", () => {
        const start = world.clock().instant();
        hardEdgeStops = assembleDayPeriodStops(
          [],
          [
            {
              instant: start.add({ minutes: edgeInstantMinutes }),
              before: DayPeriod.EVENING,
              after: DayPeriod.NIGHT,
            },
          ],
          {
            start,
            end: start.add({ minutes: dayLengthMinutes }),
            lengthMinutes: dayLengthMinutes,
          },
        );
      });
      Then(
        "two stops at {number} change from evening to night, with no blend between them",
        (_ctx, position: number) =>
          expect(hardEdgeStops).toEqual([
            { fraction: position, period: DayPeriod.EVENING },
            { fraction: position, period: DayPeriod.NIGHT },
          ]),
      );
    },
  );

  // @add-time-sliders-to-location-cards @FR7 @M6
  f.ScenarioOutline(
    "Hour labels of four zones",
    ({ Given, And, When, Then }, variables) => {
      Given("the device time zone is {string}", givenZone);
      And("the current instant is {string}", givenInstant);
      And("the list contains {string}", givenList);
      When("the list is presented", givenAppOpen);
      Then("the hour labels of <city> are <labels>", () =>
        expectCityLabels(variables.city, variables.labels),
      );
    },
  );

  // @add-time-sliders-to-location-cards @FR9 @NFR-A3
  f.ScenarioOutline(
    "Slider name and value in both languages",
    ({ Given, And, When, Then }, variables) => {
      Given("the device time zone is {string}", givenZone);
      And("the current instant is {string}", givenInstant);
      And("the list contains {string}", givenList);
      When("the interface language is <language>", async () => {
        await world.setLanguage(variables.language);
        world.open();
      });
      Then(
        "the Almaty slider is named <name> with the value text <value>",
        () => {
          expect(i18n.t("locations.timeSliderLabel", { city: "Almaty" })).toBe(
            variables.name,
          );
          expect(world.trackOf("Almaty").valueText).toBe(variables.value);
        },
      );
    },
  );
});
