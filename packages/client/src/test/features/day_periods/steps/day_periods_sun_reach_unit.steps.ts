// Verifies FR3, FR4, NFR-P2 of bind-day-periods-to-sun.
import type { FeatureDescriibeCallbackParams } from "@amiceli/vitest-cucumber";
import { describeFeature, loadFeature } from "@amiceli/vitest-cucumber";
import { afterEach, expect, vi } from "vitest";
import { type Coordinates, DayPeriod, getDayPeriodAt } from "@/model";
import {
  findBoundaryMilliseconds,
  getBoundariesOf,
  minutesBetween,
  readDayPeriodsThroughDay,
} from "./sunScenarioSupport";

const feature = await loadFeature("../day_periods_sun_reach_unit.feature");

const TOLERANCE_MINUTES = 3;
const ALMATY = { latitude: 43.3, longitude: 76.9 };
const MOSCOW = { latitude: 55.8, longitude: 37.6 };

describeFeature(feature, (f: FeatureDescriibeCallbackParams) => {
  let coordinates: Coordinates = MOSCOW;
  const fetchSpy = vi.fn();

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  // @bind-day-periods-to-sun @FR3 @NFR-P2
  f.Scenario("Offline", ({ Given, When, Then }) => {
    let offlinePeriods: DayPeriod[] = [];
    const readPeriods = () =>
      readDayPeriodsThroughDay(
        ALMATY,
        "2026-03-08",
        "Asia/Almaty",
        getDayPeriodAt,
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
