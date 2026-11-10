import type { FeatureDescriibeCallbackParams } from "@amiceli/vitest-cucumber";
import { describeFeature, loadFeature } from "@amiceli/vitest-cucumber";
import { expect } from "vitest";
import { DayPeriod } from "@/model";
import { createHourCellsSteps, parseColumnRange } from "./hourCellsWorld";

const feature = await loadFeature("../grid_view_hour_cells_unit.feature");

const ALL_CITIES = ["Almaty", "Moscow", "Kolkata", "New York"];

describeFeature(feature, (f: FeatureDescriibeCallbackParams) => {
  const { world, stripOf, setDay, setZoneAndDay, givenSampleDay } =
    createHourCellsSteps(f);

  // @add-grid-hour-cells-and-hour-frame @FR1
  f.Scenario("Four rows of 24 aligned cells", ({ Given, And, When, Then }) => {
    Given(
      "the reference zone is {string} and the current time is {string}",
      setZoneAndDay,
    );
    And("the locations are Almaty, Moscow, Kolkata and New York", () => {});
    When("the hour cells are presented", () => {});
    Then("every row has 24 hour cells", () => {
      for (const city of ALL_CITIES) {
        expect(stripOf(city).cells).toHaveLength(24);
      }
    });
    And("column 12 starts at {string} in every row", (_ctx, start: string) => {
      for (const city of ALL_CITIES) {
        expect(stripOf(city).cells[12].key).toBe(start);
      }
    });
  });

  // @add-grid-hour-cells-and-hour-frame @FR2
  f.ScenarioOutline(
    "Clock change days in the reference zone",
    ({ Given, When, Then }, variables) => {
      Given("the reference zone is {string}", (_ctx, zone: string) => {
        world.referenceZoneId = zone;
      });
      When("the reference day is <date>", () =>
        setDay(`${variables.date}T12:00:00Z`),
      );
      Then("every row has <count> hour cells", () => {
        for (const city of ALL_CITIES) {
          expect(stripOf(city).cells).toHaveLength(Number(variables.count));
        }
      });
    },
  );

  // @add-grid-hour-cells-and-hour-frame @FR4
  f.Scenario("Day periods of Almaty", ({ Given, When, Then }) => {
    Given(
      "the reference zone is {string} and the reference day is 2026-03-08",
      givenSampleDay,
    );
    When("the hour cells of Almaty are presented", () => {});
    Then(
      "columns 0-6 and 22-23 are night, 7-8 morning, 9-17 working hours and 18-21 evening",
      () => {
        const expectedPeriods: [string, DayPeriod][] = [
          ["0-6", DayPeriod.NIGHT],
          ["22-23", DayPeriod.NIGHT],
          ["7-8", DayPeriod.MORNING],
          ["9-17", DayPeriod.WORK],
          ["18-21", DayPeriod.EVENING],
        ];
        for (const [range, period] of expectedPeriods) {
          for (const column of parseColumnRange(range)) {
            expect(stripOf("Almaty").cells[column].dayPeriod).toBe(period);
          }
        }
      },
    );
  });
});
