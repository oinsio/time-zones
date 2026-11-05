// Verifies NFR-P1 of show-zone-abbreviations-and-zone-label-setting.
import type { FeatureDescriibeCallbackParams } from "@amiceli/vitest-cucumber";
import { describeFeature, loadFeature } from "@amiceli/vitest-cucumber";
import { expect, vi } from "vitest";
import type { Location } from "@/model";
import { buildLocation } from "@/test/factories/buildLocation";
import { startWorkCount, type WorkCount } from "@/test/workCounters";
import {
  startZoneLookupCount,
  type ZoneLookupCount,
} from "@/test/zoneLookupCounter";
import { cityEntry } from "./locationsUiWorld";
import {
  BUDGET_FIRST_MOMENT,
  BUDGET_ROW_COUNT,
  BUDGET_SECOND_MOMENT,
  buildBudgetLocations,
  expectNoWarmWork,
  presentBudgetRows,
} from "./rowBudgetWorld";

const feature = await loadFeature("../locations_zone_line_budget_unit.feature");

describeFeature(feature, (f: FeatureDescriibeCallbackParams) => {
  let workCount: WorkCount | undefined;
  let zoneLookups: ZoneLookupCount | undefined;
  let locations: Location[] = [];
  let instant = BUDGET_FIRST_MOMENT;
  const lookupsOf = (city: string) => {
    const timeZoneId = locations.find(({ label }) => label === city)
      ?.timeZoneId as string;
    return (
      (zoneLookups?.lookupsIn(timeZoneId) ?? 0) +
      (zoneLookups?.adjustmentsIn(timeZoneId) ?? 0)
    );
  };

  f.BeforeEachScenario(() => {
    vi.restoreAllMocks();
    locations = [];
    instant = BUDGET_FIRST_MOMENT;
  });
  f.AfterEachScenario(() => {
    workCount?.stop();
    zoneLookups?.stop();
  });

  // @show-zone-abbreviations-and-zone-label-setting @NFR-P1
  f.Scenario("Extra zone lookups per row", ({ Given, And, When, Then }) => {
    Given(
      "the list contains {string}, {string}, {string} and {string}",
      (_ctx, ...cities: string[]) => {
        locations = cities.map((city) => buildLocation(cityEntry(city)));
      },
    );
    And("the current instant is {string}", (_ctx, timestamp: string) => {
      instant = timestamp;
    });
    When(
      "the rows are presented with the zone abbreviation and the UTC offset shown",
      () => {
        zoneLookups = startZoneLookupCount();
        presentBudgetRows(locations, { timestamp: instant });
        zoneLookups.stop();
      },
    );
    Then(
      "{string} has at most {int} more zone lookups than {string}",
      (_ctx, city: string, extra: number, other: string) =>
        expect(lookupsOf(city) - lookupsOf(other)).toBeLessThanOrEqual(extra),
    );
    And(
      "{string} has as many zone lookups as {string}",
      (_ctx, city: string, other: string) =>
        expect(lookupsOf(city)).toBe(lookupsOf(other)),
    );
  });

  // @show-zone-abbreviations-and-zone-label-setting @NFR-P1
  f.Scenario("50 rows within the work bound", ({ Given, When, Then, And }) => {
    Given(
      "{int} locations whose rows have been presented once with the zone abbreviation and the UTC offset",
      (_ctx, count: number) => {
        expect(count).toBe(BUDGET_ROW_COUNT);
        locations = buildBudgetLocations(count);
        presentBudgetRows(locations);
      },
    );
    When(
      "their rows are presented again at another minute of the same day",
      () => {
        workCount = startWorkCount();
        presentBudgetRows(locations, { timestamp: BUDGET_SECOND_MOMENT });
        workCount.stop();
      },
    );
    Then("no date, time or region name formatter is built", () => {
      expect(workCount?.formatters()).toBe(0);
      expect(workCount?.displayNames()).toBe(0);
    });
    And("no time zone transition is looked up", () =>
      expectNoWarmWork(workCount as WorkCount),
    );
  });
});
