// Verifies FR8, FR9, FR11 of add-day-colouring-setting.
import type { FeatureDescriibeCallbackParams } from "@amiceli/vitest-cucumber";
import { describeFeature, loadFeature } from "@amiceli/vitest-cucumber";
import { expect } from "vitest";
import { Temporal } from "@/lib/temporal";
import { getReferenceDay, INITIAL_WORLD_CLOCK_STATE } from "@/model";
import {
  DayColouring,
  DEFAULT_WORKING_HOURS,
  HourFormat,
  type WorkingHours,
} from "@/preferences";
import { DayColour, presentHourStrip } from "@/presenter";
import { KNOWN_CITIES } from "@/test/factories/buildLocation";
import { parseColumnRange } from "../../grid_view/steps/hourCellsWorld";
import { parseWorkingHoursText } from "./dayColouringChecks";

const feature = await loadFeature("../day_colouring_hour_cells.feature");

const MIDDAY_TIME = "T12:00:00";

describeFeature(feature, (f: FeatureDescriibeCallbackParams) => {
  let dayColouring = DayColouring.TIME_OF_DAY;
  let workingHours: WorkingHours = DEFAULT_WORKING_HOURS;
  let referenceZoneId = "";
  let referenceDate = "";

  f.BeforeEachScenario(() => {
    dayColouring = DayColouring.TIME_OF_DAY;
    workingHours = DEFAULT_WORKING_HOURS;
  });

  const stripOf = (city: string) => {
    const day = getReferenceDay(
      { ...INITIAL_WORLD_CLOCK_STATE, deviceTimeZoneId: referenceZoneId },
      Temporal.PlainDateTime.from(`${referenceDate}${MIDDAY_TIME}`)
        .toZonedDateTime(referenceZoneId)
        .toInstant(),
    );
    return presentHourStrip(KNOWN_CITIES[city].timeZoneId, {
      day,
      referenceZoneId,
      language: "en",
      hourFormat: HourFormat.H24,
      dayColouring,
      workingHours,
    });
  };
  const workingColumnsOf = (city: string) =>
    stripOf(city).cells.flatMap((cell, column) =>
      cell.dayColour === DayColour.WORKING_TIME ? [column] : [],
    );
  const givenReferenceDay = (_ctx: unknown, date: string) => {
    referenceDate = date;
  };

  // @add-day-colouring-setting @FR9 @FR11
  f.Scenario("Plain hour cells", ({ Given, When, Then }) => {
    Given(
      "the day colouring is Plain, the reference zone is {string} and the reference day is 2026-03-08",
      (_ctx, zone: string) => {
        dayColouring = DayColouring.PLAIN;
        referenceZoneId = zone;
        referenceDate = "2026-03-08";
      },
    );
    When(
      "the hour cells of Almaty, Moscow, Kolkata and New York are presented",
      () => undefined,
    );
    Then("every cell of every row is plain", () => {
      for (const city of ["Almaty", "Moscow", "Kolkata", "New York"]) {
        const cells = stripOf(city).cells;
        expect(cells.length).toBeGreaterThan(0);
        expect(cells.every((cell) => cell.dayColour === DayColour.PLAIN)).toBe(
          true,
        );
      }
    });
  });

  // @add-day-colouring-setting @FR8 @FR11
  f.ScenarioOutline(
    "Half of the hour decides",
    ({ Given, And, When, Then }, variables) => {
      let city = "";
      Given(
        "the day colouring is Working hours and the reference zone is {string}",
        (_ctx, zone: string) => {
          dayColouring = DayColouring.WORKING_HOURS;
          referenceZoneId = zone;
        },
      );
      And("the reference day is 2026-03-09", () =>
        givenReferenceDay(undefined, "2026-03-09"),
      );
      And("the working hours are <hours>", () => {
        workingHours = parseWorkingHoursText(variables.hours);
      });
      When("the hour cells of <city> are presented", () => {
        city = variables.city;
      });
      Then("exactly the columns <columns> are working", () => {
        expect(workingColumnsOf(city)).toEqual(
          parseColumnRange(variables.columns),
        );
      });
    },
  );

  // @add-day-colouring-setting @FR8 @FR11
  f.Scenario(
    "Weekend cells and Friday cells across the reference day",
    ({ Given, And, When, Then }) => {
      Given(
        "the day colouring is Working hours with 10:00-18:00 and the reference zone is {string}",
        (_ctx, zone: string) => {
          dayColouring = DayColouring.WORKING_HOURS;
          workingHours = parseWorkingHoursText("10:00-18:00");
          referenceZoneId = zone;
        },
      );
      And("the reference day is 2026-03-14", () =>
        givenReferenceDay(undefined, "2026-03-14"),
      );
      When(
        "the hour cells of Moscow and New York are presented",
        () => undefined,
      );
      Then("no Moscow cell is working", () => {
        expect(workingColumnsOf("Moscow")).toEqual([]);
      });
      And("only column 0 of New York is working", () => {
        expect(workingColumnsOf("New York")).toEqual([0]);
      });
    },
  );

  // @add-day-colouring-setting @FR8 @FR11
  f.Scenario(
    "Hour cells on a clock change day",
    ({ Given, And, When, Then }) => {
      Given(
        "the day colouring is Working hours with 10:00-18:00 and the reference zone is {string}",
        (_ctx, zone: string) => {
          dayColouring = DayColouring.WORKING_HOURS;
          workingHours = parseWorkingHoursText("10:00-18:00");
          referenceZoneId = zone;
        },
      );
      And("the reference day is 2026-04-24", () =>
        givenReferenceDay(undefined, "2026-04-24"),
      );
      When("the hour cells of Cairo are presented", () => undefined);
      Then("exactly the columns 12-19 are working", () => {
        expect(workingColumnsOf("Cairo")).toEqual(parseColumnRange("12-19"));
      });
    },
  );
});
