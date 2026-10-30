import { HourFormat } from "@/preferences";
// Verifies NFR-P1 of set-home-location-and-show-differences.
import type { FeatureDescriibeCallbackParams } from "@amiceli/vitest-cucumber";
import { describeFeature, loadFeature } from "@amiceli/vitest-cucumber";
import i18n from "i18next";
import { expect, vi } from "vitest";
import { fakeClock } from "@/lib/temporal";
import { getReferenceOffsetMinutes, INITIAL_WORLD_CLOCK_STATE } from "@/model";
import { presentLocationRows } from "@/presenter";
import { buildLocation } from "@/test/factories/buildLocation";
import { buildReferenceDay } from "@/test/referenceDay";
import { startWorkCount, type WorkCount } from "@/test/workCounters";
import {
  startZoneLookupCount,
  type ZoneLookupCount,
} from "@/test/zoneLookupCounter";
import { BUDGET_ROW_COUNT } from "./rowBudgetWorld";

const feature = await loadFeature(
  "../locations_offset_difference_budget_unit.feature",
);

const HOME_ZONE = "Asia/Almaty";
const COMPARED_ZONE = "Europe/Moscow";
const OTHER_ZONES = [
  "Asia/Tokyo",
  "Europe/Paris",
  "America/Chicago",
  "Asia/Kolkata",
];
const WORK_INSTANT = "2026-03-08T07:30:00Z";
const WORK_LANGUAGE = "en";
const MAX_EXTRA_HOME_LOOKUPS = 1;

describeFeature(feature, (f: FeatureDescriibeCallbackParams) => {
  let workCount: WorkCount | undefined;
  let zoneLookups: ZoneLookupCount | undefined;
  let presentation: {
    locations: ReturnType<typeof buildLocation>[];
    homeId: string;
  };

  f.BeforeEachScenario(() => {
    vi.restoreAllMocks();
  });
  f.AfterEachScenario(() => {
    workCount?.stop();
    zoneLookups?.stop();
  });

  const presentWork = (
    locations: ReturnType<typeof buildLocation>[],
    homeId: string,
  ) => {
    const instant = fakeClock(WORK_INSTANT).instant();
    const state = {
      ...INITIAL_WORLD_CLOCK_STATE,
      locations,
      homeLocationId: homeId,
    };
    const referenceDay = buildReferenceDay(instant, HOME_ZONE);
    return () =>
      presentLocationRows(locations, {
        language: WORK_LANGUAGE,
        hourFormat: HourFormat.H24,
        instant,
        translate: i18n.getFixedT(WORK_LANGUAGE),
        deviceTimeZoneId: COMPARED_ZONE,
        homeLocationId: homeId,
        referenceOffsetMinutes: getReferenceOffsetMinutes(state, instant),
        referenceDay,
      });
  };

  // @set-home-location-and-show-differences @NFR-P1
  f.Scenario("50 rows within the work bound", ({ Given, And, When, Then }) => {
    let present: ReturnType<typeof presentWork>;
    Given("{int} locations, one of them home", (_ctx, count: number) => {
      expect(count).toBe(BUDGET_ROW_COUNT);
    });
    And(
      "the home location is the only one in {string} and one other location is the only one in {string}",
      (_ctx, homeZone: string, comparedZone: string) => {
        const zones = [homeZone, comparedZone];
        const locations = Array.from({ length: BUDGET_ROW_COUNT }, (_, index) =>
          buildLocation({
            label: `City ${index}`,
            timeZoneId: zones[index] ?? OTHER_ZONES[index % OTHER_ZONES.length],
          }),
        );
        presentation = { locations, homeId: locations[0].id };
      },
    );
    And("the rows were presented once", () => {
      present = presentWork(presentation.locations, presentation.homeId);
      present();
    });
    When("the rows are presented again", () => {
      workCount = startWorkCount();
      zoneLookups = startZoneLookupCount();
      present();
      workCount.stop();
      zoneLookups.stop();
    });
    Then("no date, time or region name formatter is built", () => {
      expect(workCount?.formatters()).toBe(0);
      expect(workCount?.displayNames()).toBe(0);
    });
    And("the reference zone's UTC offset is computed once", () => {
      const homeLookups = zoneLookups?.lookupsIn(HOME_ZONE) ?? 0;
      const comparedLookups = zoneLookups?.lookupsIn(COMPARED_ZONE) ?? 0;
      expect(comparedLookups).toBeGreaterThan(0);
      expect(homeLookups - comparedLookups).toBeLessThanOrEqual(
        MAX_EXTRA_HOME_LOOKUPS,
      );
    });
  });
});
