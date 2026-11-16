// Verifies FR2, FR5, FR9, UX1, UX3 of bind-day-periods-to-sun.
import type { FeatureDescriibeCallbackParams } from "@amiceli/vitest-cucumber";
import { describeFeature, loadFeature } from "@amiceli/vitest-cucumber";
import i18n from "i18next";
import { expect } from "vitest";
import {
  assembleDayPeriodStops,
  collectBlendWindows,
  DayPeriod,
  type DayPeriodStop,
} from "@/model";
import {
  expectLabels,
  expectPeriodColoursOutsideBlends,
} from "./dayColourChecks";
import {
  expectBoundaryStops,
  expectWholeTrackColour,
  getMorningBandPercent,
} from "./dayPeriodStopChecks";
import { createTimeSelectionWorld } from "./timeSelectionWorld";

const feature = await loadFeature("../time_selection_day_colours.feature");

const MORNING_BAND_MIN_PERCENT = 3;
const MORNING_BAND_MAX_PERCENT = 7;
const DAY_LENGTH_MINUTES = 1440;
const FIRST_BOUNDARY_MINUTES = 360;
const CLOSE_BOUNDARIES_MINUTES = 20;
const FOUR_BOUNDARIES = 4;
const STOPS_PER_BOUNDARY = 2;

describeFeature(feature, (f: FeatureDescriibeCallbackParams) => {
  const world = createTimeSelectionWorld();

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
  const expectCityLabels = (city: string, labelsText: string) =>
    expectLabels(world, city, labelsText);

  // @bind-day-periods-to-sun @FR5
  f.ScenarioOutline(
    "Colour stops of Almaty and New York",
    ({ Given, And, When, Then }, variables) => {
      Given(
        "the day colouring is Time of day and the device time zone is {string}",
        givenZone,
      );
      And("the current instant is {string}", givenInstant);
      And("the list contains {string}", givenList);
      When("the user opens the app", givenAppOpen);
      Then(
        "the colour stops of <city> change period, in order, around <boundaries> in the time of Asia/Almaty",
        () => expectBoundaryStops(world, variables.city, variables.boundaries),
      );
      And(
        "each pair of stops is 30 minutes apart and centred within 3 minutes of that time",
        () => undefined,
      );
    },
  );

  // @bind-day-periods-to-sun @FR5
  f.Scenario(
    "Colours follow the day period outside blend windows",
    ({ Given, And, When, Then }) => {
      Given(
        "the day colouring is Time of day and the device time zone is {string}",
        givenZone,
      );
      And("the current instant is {string}", givenInstant);
      And("the list contains {string}", givenList);
      And("the app is open", givenAppOpen);
      When(
        "the colour of the tracks is read at each quarter-hour position outside a blend window",
        () => undefined,
      );
      Then(
        "it is the colour of that location's day period at that instant",
        () => {
          expect(expectPeriodColoursOutsideBlends(world)).toBeGreaterThan(0);
        },
      );
    },
  );

  // @bind-day-periods-to-sun @FR5 @UX1 @M6
  f.Scenario(
    "Morning and evening are visible bands",
    ({ Given, And, When, Then }) => {
      Given(
        "the day colouring is Time of day and the device time zone is {string}",
        givenZone,
      );
      And("the current instant is {string}", givenInstant);
      And("the list contains {string}", givenList);
      When("the user opens the app", givenAppOpen);
      Then(
        "the morning band of Moscow is between 3% and 7% of the track",
        () => {
          const percent = getMorningBandPercent(world, "Moscow");
          expect(percent).toBeGreaterThanOrEqual(MORNING_BAND_MIN_PERCENT);
          expect(percent).toBeLessThanOrEqual(MORNING_BAND_MAX_PERCENT);
        },
      );
    },
  );

  // @bind-day-periods-to-sun @FR5
  f.Scenario(
    "A blend window stops at the midpoint",
    ({ Given, When, Then }) => {
      let stops: readonly DayPeriodStop[] = [];
      Given(
        "two day-period boundaries 20 minutes apart inside the reference day",
        () => undefined,
      );
      When("the colour stops are assembled", () => {
        const start = world.clock().instant();
        const day = {
          start,
          end: start.add({ minutes: DAY_LENGTH_MINUTES }),
          lengthMinutes: DAY_LENGTH_MINUTES,
          clockChangeWindow: { start, end: start },
        };
        const first = start.add({ minutes: FIRST_BOUNDARY_MINUTES });
        stops = assembleDayPeriodStops(
          collectBlendWindows(
            [
              { instant: first, from: DayPeriod.NIGHT, to: DayPeriod.MORNING },
              {
                instant: first.add({ minutes: CLOSE_BOUNDARIES_MINUTES }),
                from: DayPeriod.MORNING,
                to: DayPeriod.DAY,
              },
            ],
            day,
          ),
          day,
        );
      });
      Then(
        "the blend windows of the two boundaries meet at the midpoint between them and do not overlap",
        () => {
          const midpointFraction =
            (FIRST_BOUNDARY_MINUTES + CLOSE_BOUNDARIES_MINUTES / 2) /
            DAY_LENGTH_MINUTES;
          expect([stops[1].fraction, stops[2].fraction]).toEqual([
            midpointFraction,
            midpointFraction,
          ]);
          expect(stops.map((stop) => stop.fraction)).toEqual(
            [...stops.map((stop) => stop.fraction)].sort((x, y) => x - y),
          );
        },
      );
    },
  );

  // @bind-day-periods-to-sun @FR5 @FR9
  f.Scenario(
    "A clock change makes no colour edge",
    ({ Given, And, When, Then }) => {
      Given(
        "the day colouring is Time of day and the device time zone is {string}",
        givenZone,
      );
      And("the current instant is {string}", givenInstant);
      And("the list contains {string}", givenList);
      And("the app is open", givenAppOpen);
      And("the moment is pinned at its current position", givenPinnedHere);
      When("the track of New York is presented", () =>
        expect(world.trackOf("New York")).toBeDefined(),
      );
      Then(
        "no two colour stops stand at the position of the clock change",
        () => {
          const fractions = world
            .trackOf("New York")
            .stops.map((stop) => stop.fraction);
          expect(new Set(fractions).size).toBe(fractions.length);
        },
      );
      And(
        "the stops are those of the four day-period boundaries of that day",
        () => {
          expect(world.trackOf("New York").stops).toHaveLength(
            FOUR_BOUNDARIES * STOPS_PER_BOUNDARY,
          );
        },
      );
    },
  );

  // @bind-day-periods-to-sun @FR2 @FR5 @UX3
  f.ScenarioOutline(
    "A polar track is one colour",
    ({ Given, And, When, Then }, variables) => {
      Given(
        "the day colouring is Time of day and the device time zone is {string}",
        givenZone,
      );
      And("the current instant is <instant>", () =>
        world.setInstant(variables.instant),
      );
      And("the list contains {string}", givenList);
      When("the user opens the app", givenAppOpen);
      Then("the whole track of Longyearbyen is the <colour> colour", () =>
        expectWholeTrackColour(world, "Longyearbyen", variables.colour),
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
