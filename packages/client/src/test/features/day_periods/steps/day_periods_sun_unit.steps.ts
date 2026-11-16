// Verifies FR1, FR3, FR4, FR7, FR8, UX2, NFR-P2 of bind-day-periods-to-sun.
import type { FeatureDescriibeCallbackParams } from "@amiceli/vitest-cucumber";
import { describeFeature, loadFeature } from "@amiceli/vitest-cucumber";
import { afterEach, expect, vi } from "vitest";
import { type Coordinates, DayPeriod, getDayPeriodAt } from "@/model";
import {
  findBoundaryMilliseconds,
  getBoundariesOf,
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
  const fetchSpy = vi.fn();

  afterEach(() => {
    vi.unstubAllGlobals();
  });

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
          const boundaries = getBoundariesOf(
            coordinates,
            variables.zone,
            variables.date,
          );
          const expectations: [DayPeriod, DayPeriod, string][] = [
            [DayPeriod.NIGHT, DayPeriod.MORNING, variables.dawn],
            [DayPeriod.MORNING, DayPeriod.DAY, variables["day start"]],
            [DayPeriod.DAY, DayPeriod.EVENING, variables["day end"]],
            [DayPeriod.EVENING, DayPeriod.NIGHT, variables.dusk],
          ];
          for (const [from, to, time] of expectations) {
            const actual = findBoundaryMilliseconds(boundaries, from, to);
            expect(actual).toBeDefined();
            expect(
              minutesBetween(
                actual as number,
                toMilliseconds(variables.date, time, variables.zone),
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
        const dayStartOf = (cityCoordinates: Coordinates) =>
          findBoundaryMilliseconds(
            getBoundariesOf(cityCoordinates, MOSCOW_ZONE, "2026-06-21"),
            DayPeriod.MORNING,
            DayPeriod.DAY,
          ) as number;
        expect(
          minutesBetween(
            dayStartOf(MOSCOW),
            toMilliseconds("2026-06-21", "04:48", MOSCOW_ZONE),
          ),
        ).toBeLessThan(TOLERANCE_MINUTES);
        expect(
          minutesBetween(
            dayStartOf(KAZAN),
            toMilliseconds("2026-06-21", "04:02", MOSCOW_ZONE),
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
          const boundaries = getBoundariesOf(NEW_YORK, newYorkZone, date);
          const nightEnds = findBoundaryMilliseconds(
            boundaries,
            DayPeriod.NIGHT,
            DayPeriod.MORNING,
          ) as number;
          const dayStarts = findBoundaryMilliseconds(
            boundaries,
            DayPeriod.MORNING,
            DayPeriod.DAY,
          ) as number;
          expect(
            minutesBetween(
              nightEnds,
              toMilliseconds(date, "06:51", newYorkZone),
            ),
          ).toBeLessThan(TOLERANCE_MINUTES);
          expect(
            minutesBetween(
              dayStarts,
              toMilliseconds(date, "07:55", newYorkZone),
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

  // @bind-day-periods-to-sun @FR3 @NFR-P2
  f.Scenario("Offline", ({ Given, When, Then }) => {
    let offlinePeriods: DayPeriod[] = [];
    const readPeriods = () =>
      [0, 6, 12, 18].map((hour) =>
        getDayPeriodAt(
          ALMATY,
          toMilliseconds(
            "2026-03-08",
            `${String(hour).padStart(2, "0")}:00`,
            "Asia/Almaty",
          ),
        ),
      );
    const onlinePeriods = readPeriods();
    Given("the device has no network connection", () => {
      vi.stubGlobal("fetch", fetchSpy);
      vi.stubGlobal("navigator", { onLine: false });
    });
    When("the day periods of Almaty are computed", () => {
      offlinePeriods = readPeriods();
    });
    Then("they are the same as online and nothing was requested", () => {
      expect(offlinePeriods).toEqual(onlinePeriods);
      expect(fetchSpy).not.toHaveBeenCalled();
    });
  });

  // @bind-day-periods-to-sun @FR4
  f.Scenario("A far date", ({ Given, When, Then }) => {
    Given("Moscow at 55.8, 37.6", () => {
      coordinates = MOSCOW;
    });
    When(
      "the day-period boundaries of 21 December 2090 are computed",
      () => undefined,
    );
    Then(
      "night ends at {string}, which is 08:10 in {string}, within 3 minutes",
      (_ctx, instant: string, zone: string) => {
        const nightEnds = findBoundaryMilliseconds(
          getBoundariesOf(coordinates, zone, "2090-12-21"),
          DayPeriod.NIGHT,
          DayPeriod.MORNING,
        ) as number;
        expect(minutesBetween(nightEnds, Date.parse(instant))).toBeLessThan(
          TOLERANCE_MINUTES,
        );
      },
    );
  });
});
