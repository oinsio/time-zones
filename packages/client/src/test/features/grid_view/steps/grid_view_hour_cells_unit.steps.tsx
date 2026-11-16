// Verifies FR1, FR2, FR4 of add-grid-hour-cells-and-hour-frame and FR6 of bind-day-periods-to-sun.
import type { FeatureDescriibeCallbackParams } from "@amiceli/vitest-cucumber";
import { describeFeature, loadFeature } from "@amiceli/vitest-cucumber";
import { expect } from "vitest";
import { Temporal } from "@/lib/temporal";
import {
  DayPeriod,
  type DayPeriodBoundary,
  getHourCells,
  getLargestSharePeriod,
} from "@/model";
import { DayColour } from "@/presenter";
import { createHourCellsSteps, parseColumnRange } from "./hourCellsWorld";

const feature = await loadFeature("../grid_view_hour_cells_unit.feature");

const ALL_CITIES = ["Almaty", "Moscow", "Kolkata", "New York"];
const ALMATY_ZONE = "Asia/Almaty";
const SAMPLE_INSTANT = "2026-03-08T07:30:00Z";
const MILLISECONDS_PER_HOUR = 3_600_000;

describeFeature(feature, (f: FeatureDescriibeCallbackParams) => {
  const { world, stripOf, setDay, setZoneAndDay, givenSampleDay } =
    createHourCellsSteps(f);

  /** The boundaries night to morning and morning to day at two local times of the Almaty day. */
  const buildBoundaries = (
    localTimes: [string, string],
  ): DayPeriodBoundary[] => [
    {
      instant: instantAt(localTimes[0]),
      from: DayPeriod.NIGHT,
      to: DayPeriod.MORNING,
    },
    {
      instant: instantAt(localTimes[1]),
      from: DayPeriod.MORNING,
      to: DayPeriod.DAY,
    },
  ];
  const instantAt = (localTime: string) =>
    Temporal.PlainDateTime.from(`2026-03-08T${localTime}`)
      .toZonedDateTime(ALMATY_ZONE)
      .toInstant();
  const periodOfCellAt = (
    boundaries: DayPeriodBoundary[],
    localTime: string,
  ) => {
    const cell = getHourCells(
      ALMATY_ZONE,
      world.day,
      ALMATY_ZONE,
      undefined,
    ).find((candidate) => candidate.start.equals(instantAt(localTime)));
    if (cell === undefined) throw new Error(`no cell at ${localTime}`);
    const start = cell.start.epochMilliseconds;
    return getLargestSharePeriod(
      boundaries,
      DayPeriod.NIGHT,
      start,
      start + MILLISECONDS_PER_HOUR,
    );
  };

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

  // @bind-day-periods-to-sun @FR6
  f.Scenario("Day periods of Almaty", ({ Given, When, Then }) => {
    Given(
      "the day colouring is Time of day, the reference zone is {string} and the reference day is 2026-03-08",
      givenSampleDay,
    );
    When("the hour cells of Almaty at 43.3, 76.9 are presented", () => {});
    Then(
      "columns 0-5 and 18-23 are night, column 6 is morning, columns 7-16 are day and column 17 is evening",
      () => {
        const expectedPeriods: [string, DayColour][] = [
          ["0-5", DayColour.NIGHT],
          ["18-23", DayColour.NIGHT],
          ["6-6", DayColour.MORNING],
          ["7-16", DayColour.DAY],
          ["17-17", DayColour.EVENING],
        ];
        for (const [range, period] of expectedPeriods) {
          for (const column of parseColumnRange(range)) {
            expect(stripOf("Almaty").cells[column].dayColour).toBe(period);
          }
        }
      },
    );
  });

  // @bind-day-periods-to-sun @FR6
  f.Scenario("The larger part decides", ({ Given, When, Then, And }) => {
    let boundaries: DayPeriodBoundary[] = [];
    Given(
      "a location whose night ends at 06:05 and whose day starts at 06:55 local time",
      () => {
        setZoneAndDay(undefined, ALMATY_ZONE, SAMPLE_INSTANT);
        boundaries = buildBoundaries(["06:05", "06:55"]);
      },
    );
    When("its hour cells are presented in the Time of day colouring", () => {});
    Then("the cell that starts at 06:00 is morning", () =>
      expect(periodOfCellAt(boundaries, "06:00")).toBe(DayPeriod.MORNING),
    );
    And("the cell that starts at 07:00 is day", () =>
      expect(periodOfCellAt(boundaries, "07:00")).toBe(DayPeriod.DAY),
    );
  });

  // @bind-day-periods-to-sun @FR6
  f.Scenario("A tie takes the earlier period", ({ Given, When, Then }) => {
    let boundaries: DayPeriodBoundary[] = [];
    Given(
      "a location whose night ends at 06:30 local time and whose day starts after 07:00",
      () => {
        setZoneAndDay(undefined, ALMATY_ZONE, SAMPLE_INSTANT);
        boundaries = buildBoundaries(["06:30", "07:30"]);
      },
    );
    When("its hour cells are presented in the Time of day colouring", () => {});
    Then("the cell that starts at 06:00 is night", () =>
      expect(periodOfCellAt(boundaries, "06:00")).toBe(DayPeriod.NIGHT),
    );
  });
});
