// Verifies FR1, FR3, FR4, FR7, FR8, UX2 of bind-day-periods-to-sun.
import type { FeatureDescriibeCallbackParams } from "@amiceli/vitest-cucumber";
import { describeFeature, loadFeature } from "@amiceli/vitest-cucumber";
import { expect } from "vitest";
import { type Coordinates, DayPeriod, getDayPeriodAt } from "@/model";
import {
  getBoundariesOf,
  getBoundaryDeviationMinutes,
  minutesBetween,
  PERIOD_BY_WORD,
  parseCoordinatesText,
  toMilliseconds,
} from "./sunScenarioSupport";

const feature = await loadFeature("../day_periods_sun_unit.feature");

const TOLERANCE_MINUTES = 3;
const ALMATY = { latitude: 43.3, longitude: 76.9 };
const MOSCOW = { latitude: 55.8, longitude: 37.6 };
const KAZAN = { latitude: 55.8, longitude: 49.1 };
const NEW_YORK = { latitude: 40.7, longitude: -74.0 };
const MOSCOW_ZONE = "Europe/Moscow";

describeFeature(feature, (f: FeatureDescriibeCallbackParams) => {
  let coordinates: Coordinates = ALMATY;
  let date = "";

  // @bind-day-periods-to-sun @FR1
  f.ScenarioOutline(
    "A day at a middle latitude",
    ({ Given, When, Then }, variables) => {
      Given("Almaty at 43.3, 76.9 on 8 March 2026", () => {
        coordinates = ALMATY;
        date = "2026-03-08";
      });
      let period = DayPeriod.NIGHT;
      When("the day period is read at <local time> in Asia/Almaty", () => {
        period = getDayPeriodAt(
          coordinates,
          toMilliseconds(date, variables["local time"], "Asia/Almaty"),
        );
      });
      Then("it is <period>", () => {
        expect(period).toBe(PERIOD_BY_WORD[variables.period]);
      });
    },
  );

  // @bind-day-periods-to-sun @FR1 @FR4
  f.ScenarioOutline(
    "Boundaries of the day",
    ({ Given, When, Then }, variables) => {
      Given("<city> at <coordinates> on <date>", () => {
        coordinates = parseCoordinatesText(variables.coordinates);
      });
      When(
        "the day-period boundaries of that day are computed",
        () => undefined,
      );
      Then(
        "in <zone> night ends at <dawn>, day starts at <day start>, day ends at <day end> and night starts at <dusk>, each within 3 minutes",
        () => {
          const expectations: [[DayPeriod, DayPeriod], string][] = [
            [[DayPeriod.NIGHT, DayPeriod.MORNING], variables.dawn],
            [[DayPeriod.MORNING, DayPeriod.DAY], variables["day start"]],
            [[DayPeriod.DAY, DayPeriod.EVENING], variables["day end"]],
            [[DayPeriod.EVENING, DayPeriod.NIGHT], variables.dusk],
          ];
          for (const [boundary, time] of expectations) {
            expect(
              getBoundaryDeviationMinutes(
                coordinates,
                variables.zone,
                variables.date,
                boundary,
                time,
              ),
            ).toBeLessThan(TOLERANCE_MINUTES);
          }
        },
      );
    },
  );

  // @bind-day-periods-to-sun @FR1 @FR7 @UX2
  f.Scenario("Two cities of one zone differ", ({ Given, When, Then }) => {
    Given(
      "Moscow at 55.8, 37.6 and Kazan at 55.8, 49.1, both in {string}, on 21 June 2026",
      () => undefined,
    );
    When("the day-period boundaries are computed", () => undefined);
    Then(
      "the day starts at 04:48 in Moscow and at 04:02 in Kazan, each within 3 minutes",
      () => {
        const dayStart: [DayPeriod, DayPeriod] = [
          DayPeriod.MORNING,
          DayPeriod.DAY,
        ];
        expect(
          getBoundaryDeviationMinutes(
            MOSCOW,
            MOSCOW_ZONE,
            "2026-06-21",
            dayStart,
            "04:48",
          ),
        ).toBeLessThan(TOLERANCE_MINUTES);
        expect(
          getBoundaryDeviationMinutes(
            KAZAN,
            MOSCOW_ZONE,
            "2026-06-21",
            dayStart,
            "04:02",
          ),
        ).toBeLessThan(TOLERANCE_MINUTES);
      },
    );
  });

  // @bind-day-periods-to-sun @FR3
  f.Scenario(
    "A clock change does not move the sun",
    ({ Given, When, Then, And }) => {
      const newYorkZone = "America/New_York";
      Given(
        "New York at 40.7, -74.0 on 8 March 2026, when its clocks go forward",
        () => {
          date = "2026-03-08";
        },
      );
      When("the day-period boundaries are computed", () => undefined);
      Then(
        "night ends at 06:51 and the day starts at 07:55 local time, each within 3 minutes",
        () => {
          const nightEnds: [DayPeriod, DayPeriod] = [
            DayPeriod.NIGHT,
            DayPeriod.MORNING,
          ];
          const dayStarts: [DayPeriod, DayPeriod] = [
            DayPeriod.MORNING,
            DayPeriod.DAY,
          ];
          expect(
            getBoundaryDeviationMinutes(
              NEW_YORK,
              newYorkZone,
              date,
              nightEnds,
              "06:51",
            ),
          ).toBeLessThan(TOLERANCE_MINUTES);
          expect(
            getBoundaryDeviationMinutes(
              NEW_YORK,
              newYorkZone,
              date,
              dayStarts,
              "07:55",
            ),
          ).toBeLessThan(TOLERANCE_MINUTES);
        },
      );
      And(
        "the absolute instants are the same as if the clocks had not changed",
        () => {
          const withClockChange = getBoundariesOf(NEW_YORK, newYorkZone, date);
          const inFixedZone = getBoundariesOf(NEW_YORK, "Etc/GMT+5", date);
          const sunBoundaries = (boundaries: typeof withClockChange) =>
            boundaries
              .filter((boundary) => boundary.to !== boundary.from)
              .map((boundary) => boundary.instant.epochMilliseconds);
          const [first] = sunBoundaries(withClockChange);
          expect(
            sunBoundaries(inFixedZone).some(
              (instant) => minutesBetween(instant, first) < 1,
            ),
          ).toBe(true);
        },
      );
    },
  );
});
