// Verifies FR2, FR4, UX3 of bind-day-periods-to-sun.
import type { FeatureDescriibeCallbackParams } from "@amiceli/vitest-cucumber";
import { describeFeature, loadFeature } from "@amiceli/vitest-cucumber";
import { expect } from "vitest";
import {
  type Coordinates,
  DayPeriod,
  type DayPeriodBoundary,
  getDayPeriodAt,
  getDayPeriodBoundaries,
} from "@/model";
import {
  findBoundaryMilliseconds,
  getBoundariesOf,
  getDayOf,
  minutesBetween,
  parseCoordinatesText,
  toMilliseconds,
} from "./sunScenarioSupport";

const feature = await loadFeature("../day_periods_polar_unit.feature");

const POLAR_TOLERANCE_MINUTES = 10;
const MOSCOW_ZONE = "Europe/Moscow";
const OSLO_ZONE = "Europe/Oslo";
const SAINT_PETERSBURG = { latitude: 59.9, longitude: 30.3 };

type ExpectedChange = { to: DayPeriod; localTime: string };
type ExpectedDay = {
  zone: string;
  start: DayPeriod;
  changes: ExpectedChange[];
};

const EXPECTED_BY_ROW: Record<string, ExpectedDay> = {
  "Longyearbyen|2026-12-21": {
    zone: OSLO_ZONE,
    start: DayPeriod.NIGHT,
    changes: [],
  },
  "Longyearbyen|2026-06-21": {
    zone: OSLO_ZONE,
    start: DayPeriod.DAY,
    changes: [],
  },
  "Murmansk|2026-12-21": {
    zone: MOSCOW_ZONE,
    start: DayPeriod.NIGHT,
    changes: [
      { to: DayPeriod.MORNING, localTime: "10:22" },
      { to: DayPeriod.EVENING, localTime: "12:45" },
      { to: DayPeriod.NIGHT, localTime: "15:08" },
    ],
  },
  "Murmansk|2026-06-21": {
    zone: MOSCOW_ZONE,
    start: DayPeriod.EVENING,
    changes: [
      { to: DayPeriod.MORNING, localTime: "00:49" },
      { to: DayPeriod.DAY, localTime: "03:12" },
      { to: DayPeriod.EVENING, localTime: "22:26" },
    ],
  },
};

/** The boundaries that fall inside the reference day itself, not in its widened margin. */
const getBoundariesInsideDay = (
  coordinates: Coordinates,
  zone: string,
  date: string,
): DayPeriodBoundary[] => {
  const day = getDayOf(zone, date);
  return getDayPeriodBoundaries(coordinates, day).filter(
    (boundary) =>
      boundary.instant.epochMilliseconds >= day.start.epochMilliseconds &&
      boundary.instant.epochMilliseconds < day.end.epochMilliseconds,
  );
};

describeFeature(feature, (f: FeatureDescriibeCallbackParams) => {
  let coordinates: Coordinates = SAINT_PETERSBURG;

  // @bind-day-periods-to-sun @FR2 @UX3
  f.ScenarioOutline("The polar cases", ({ Given, When, Then }, variables) => {
    Given("<city> at <coordinates> on <date>", () => {
      coordinates = parseCoordinatesText(variables.coordinates);
    });
    When("the day periods of that day are computed", () => undefined);
    Then("the periods of the day are <periods>", () => {
      const expected = EXPECTED_BY_ROW[`${variables.city}|${variables.date}`];
      const day = getDayOf(expected.zone, variables.date);
      expect(getDayPeriodAt(coordinates, day.start.epochMilliseconds)).toBe(
        expected.start,
      );
      const inside = getBoundariesInsideDay(
        coordinates,
        expected.zone,
        variables.date,
      );
      expect(inside.map((boundary) => boundary.to)).toEqual(
        expected.changes.map((change) => change.to),
      );
      expected.changes.forEach((change, index) => {
        expect(
          minutesBetween(
            inside[index].instant.epochMilliseconds,
            toMilliseconds(variables.date, change.localTime, expected.zone),
          ),
        ).toBeLessThan(POLAR_TOLERANCE_MINUTES);
      });
    });
  });

  // @bind-day-periods-to-sun @FR2 @FR4
  f.Scenario("A night that barely gets dark", ({ Given, When, Then }) => {
    Given("Saint Petersburg at 59.9, 30.3 on 21 June 2026", () => {
      coordinates = SAINT_PETERSBURG;
    });
    When("the day periods are computed", () => undefined);
    Then(
      "night lasts from about 00:09 to about 01:51 in {string}, each within 10 minutes",
      (_ctx, zone: string) => {
        const boundaries = getBoundariesOf(coordinates, zone, "2026-06-21");
        const nightStarts = findBoundaryMilliseconds(
          boundaries,
          DayPeriod.EVENING,
          DayPeriod.NIGHT,
        ) as number;
        const nightEnds = findBoundaryMilliseconds(
          boundaries,
          DayPeriod.NIGHT,
          DayPeriod.MORNING,
        ) as number;
        expect(
          minutesBetween(
            nightStarts,
            toMilliseconds("2026-06-21", "00:09", zone),
          ),
        ).toBeLessThan(POLAR_TOLERANCE_MINUTES);
        expect(
          minutesBetween(
            nightEnds,
            toMilliseconds("2026-06-21", "01:51", zone),
          ),
        ).toBeLessThan(POLAR_TOLERANCE_MINUTES);
      },
    );
  });
});
