import type { FeatureDescriibeCallbackParams } from "@amiceli/vitest-cucumber";
import { describeFeature, loadFeature } from "@amiceli/vitest-cucumber";
import i18n from "i18next";
import { expect, vi } from "vitest";
import { ONE_DAY } from "@/constants";
import { fakeClock } from "@/lib/temporal";
import { getReferenceOffsetMinutes, INITIAL_WORLD_CLOCK_STATE } from "@/model";
import { formatOffsetDifference, presentLocationRows } from "@/presenter";
import { buildLocation } from "@/test/factories/buildLocation";
import { buildReferenceDay } from "@/test/referenceDay";
import { startWorkCount, type WorkCount } from "@/test/workCounters";
import {
  startZoneLookupCount,
  type ZoneLookupCount,
} from "@/test/zoneLookupCounter";
import { createHomeLocationWorld } from "../../home_location/steps/homeLocationWorld";
import { cityEntry } from "./locationsUiWorld";
import { BUDGET_ROW_COUNT } from "./rowBudgetWorld";

const feature = await loadFeature(
  "../locations_offset_difference_unit.feature",
);

const LANGUAGE_CODES: Record<string, "en" | "ru"> = {
  English: "en",
  Russian: "ru",
};
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
const UNKNOWN_ZONE_LABEL = "Olympus";

describeFeature(feature, (f: FeatureDescriibeCallbackParams) => {
  const home = createHomeLocationWorld();
  const { world } = home;
  const { givenZone, givenInstant, givenList, givenHome, givenOpen } =
    home.steps;
  let workCount: WorkCount | undefined;
  let zoneLookups: ZoneLookupCount | undefined;
  let presentation: {
    locations: ReturnType<typeof buildLocation>[];
    homeId: string;
  };
  let shownText: string;

  f.BeforeEachScenario(async () => {
    vi.restoreAllMocks();
    await home.reset();
  });
  f.AfterEachScenario(() => {
    workCount?.stop();
    zoneLookups?.stop();
  });
  f.AfterAllScenarios(world.finish);

  const rowOf = (city: string) =>
    world.getLocations().rows.find((row) => row.cityLabel === city);
  const thenShowsDifference = (_ctx: unknown, city: string, label: string) =>
    expect(rowOf(city)?.offsetDifferenceLabel).toBe(label);
  const thenShowsNoDifference = (_ctx: unknown, city: string) =>
    expect(rowOf(city)?.offsetDifferenceLabel).toBe("");
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
        instant,
        translate: i18n.getFixedT(WORK_LANGUAGE),
        deviceTimeZoneId: COMPARED_ZONE,
        homeLocationId: homeId,
        referenceOffsetMinutes: getReferenceOffsetMinutes(state, instant),
        referenceDay,
      });
  };

  // @set-home-location-and-show-differences @FR5
  f.Scenario("Differences from home", ({ Given, And, When, Then }) => {
    Given("the device time zone is {string}", givenZone);
    And("the current instant is {string}", givenInstant);
    And("the list contains {string}", givenList);
    And("{string} is home", givenHome);
    When("the user opens the app", givenOpen);
    Then(
      "the differences are:",
      (_ctx, table: { city: string; difference: string }[]) => {
        for (const { city, difference } of table) {
          thenShowsDifference(_ctx, city, difference);
        }
      },
    );
    And("{string} shows no difference", thenShowsNoDifference);
  });

  // @set-home-location-and-show-differences @FR5
  f.ScenarioOutline(
    "DST changes the difference",
    ({ Given, And, When, Then }, variables) => {
      Given("the list contains {string}", givenList);
      And("{string} is home", givenHome);
      When("the moment is pinned to <instant>", async () => {
        const instant = fakeClock(variables.instant).instant();
        world.setInstant(instant.subtract({ hours: ONE_DAY * 24 }).toString());
        await world.openApp();
        await world.showNextDay();
      });
      Then("{string} shows the difference <difference>", (_ctx, city: string) =>
        thenShowsDifference(_ctx, city, variables.difference),
      );
    },
  );

  // @set-home-location-and-show-differences @FR5
  f.Scenario(
    "Differences from the device time zone without home",
    ({ Given, And, When, Then }) => {
      Given("the device time zone is {string}", givenZone);
      And("the list contains {string}", givenList);
      When("the user opens the app", givenOpen);
      Then("{string} shows the difference {string}", thenShowsDifference);
      And("{string} shows no difference", thenShowsNoDifference);
    },
  );

  // @set-home-location-and-show-differences @FR5
  f.Scenario("Same offset, another zone", ({ Given, And, When, Then }) => {
    Given("the list contains {string}", givenList);
    And("{string} is home", givenHome);
    When("the user opens the app", givenOpen);
    Then("{string} shows the difference {string}", thenShowsDifference);
  });

  // @set-home-location-and-show-differences @FR5
  f.Scenario("Unknown zone", ({ Given, When, Then }) => {
    Given(
      "the list holds Moscow and a location whose zone the browser does not know",
      () =>
        world.setStoredLocations([
          buildLocation(cityEntry("Moscow")),
          buildLocation({
            label: UNKNOWN_ZONE_LABEL,
            timeZoneId: "Nowhere/Olympus",
            countryCode: "",
          }),
        ]),
    );
    When("the user opens the app", givenOpen);
    Then("the location with the unknown zone shows no difference", () =>
      thenShowsNoDifference(undefined, UNKNOWN_ZONE_LABEL),
    );
  });

  // @set-home-location-and-show-differences @FR4 @FR5
  f.Scenario(
    "A home change updates the differences at once",
    ({ Given, And, When, Then }) => {
      Given("the list contains {string}", givenList);
      And("{string} is home", givenHome);
      And("the app is open", givenOpen);
      When("the user makes {string} home", home.steps.whenMakesHome);
      Then("{string} shows the difference {string}", thenShowsDifference);
      And("{string} shows no difference", thenShowsNoDifference);
    },
  );

  // @set-home-location-and-show-differences @FR6
  f.ScenarioOutline("Texts in both languages", ({ When, Then }, variables) => {
    When("a difference of <minutes> minutes is shown in <language>", () => {
      shownText = formatOffsetDifference(
        Number(variables.minutes),
        i18n.getFixedT(LANGUAGE_CODES[variables.language]),
      ).label;
    });
    Then("the text is <text>", () => expect(shownText).toBe(variables.text));
  });

  // @set-home-location-and-show-differences @NFR-A3
  f.ScenarioOutline("Accessible texts", ({ When, Then }, variables) => {
    When("a difference of <minutes> minutes is read in <language>", () => {
      shownText = formatOffsetDifference(
        Number(variables.minutes),
        i18n.getFixedT(LANGUAGE_CODES[variables.language]),
      ).accessibleLabel;
    });
    Then("the accessible text is <text>", () =>
      expect(shownText).toBe(variables.text),
    );
  });

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
