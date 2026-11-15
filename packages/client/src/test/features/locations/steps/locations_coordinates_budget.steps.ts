// Implements NFR-P2, NFR-P3 of add-city-coordinates-to-locations: coordinates cost no extra work (ADR-0008).
import type { FeatureDescriibeCallbackParams } from "@amiceli/vitest-cucumber";
import { describeFeature, loadFeature } from "@amiceli/vitest-cucumber";
import { act, cleanup, waitFor } from "@testing-library/react/pure";
import { expect } from "vitest";
import { buildLocation } from "@/test/factories/buildLocation";
import { startWorkCount, type WorkCount } from "@/test/workCounters";
import {
  buildCityLocation,
  COORDINATES_BY_LABEL,
  openStoredList,
  type StoredListWorld,
} from "./locationsCoordinatesWorld";
import { BUDGET_FIRST_MOMENT, presentBudgetRows } from "./rowBudgetWorld";

const feature = await loadFeature("../locations_coordinates_budget.feature");

const expectedLookupCount = 2;
const TWIN_ZONE_ID = "Europe/Minsk";
const withCoordinates = (label: string) =>
  buildCityLocation(label, COORDINATES_BY_LABEL[label]);
const countWork = (count: WorkCount) => ({
  formatters: count.formatters(),
  collators: count.collators(),
  transitionLookups: count.transitionLookups(),
});

describeFeature(feature, (f: FeatureDescriibeCallbackParams) => {
  let world: StoredListWorld;
  let normalizationCount: WorkCount | undefined;
  let locations = [buildCityLocation("Moscow")];

  f.BeforeEachScenario(() => {
    cleanup();
    normalizationCount?.stop();
    normalizationCount = undefined;
  });
  f.AfterAllScenarios(() => {
    cleanup();
    normalizationCount?.stop();
  });

  const whenDataLoads = async () => {
    normalizationCount = startWorkCount();
    world = openStoredList({ locations });
    await waitFor(() => expect(world.loader.getLoadCount()).toBe(1));
    await act(async () => undefined);
  };
  const thenLookups = (count: number) => () =>
    expect(world.loader.getLookupCount()).toBe(count);

  // @add-city-coordinates-to-locations @NFR-P2
  f.Scenario(
    "One lookup per location that lacks coordinates",
    ({ Given, When, Then, And }) => {
      Given(
        "the stored list holds Moscow with coordinates and Kazan and Almaty without",
        () => {
          locations = [
            withCoordinates("Moscow"),
            buildCityLocation("Kazan"),
            buildCityLocation("Almaty"),
          ];
        },
      );
      When("the city data finishes loading", whenDataLoads);
      Then(
        "exactly {int} coordinate lookups were made",
        (_ctx, count: number) => {
          expect(count).toBe(expectedLookupCount);
          expect(world.loader.getLookupCount()).toBe(count);
        },
      );
      And("no text was normalized", () => {
        normalizationCount?.stop();
        expect(normalizationCount?.normalizations()).toBe(0);
      });
    },
  );

  // @add-city-coordinates-to-locations @NFR-P2
  f.Scenario("No lookup when nothing is missing", ({ Given, When, Then }) => {
    Given("every city location of the stored list holds coordinates", () => {
      locations = ["Moscow", "Kazan"].map(withCoordinates);
    });
    When("the city data finishes loading", whenDataLoads);
    Then("no coordinate lookup was made", thenLookups(0));
  });

  // @add-city-coordinates-to-locations @NFR-P2
  f.Scenario("A minute tick looks up nothing", ({ Given, When, Then }) => {
    Given("the city data is loaded and the list holds Kazan", async () => {
      locations = [buildCityLocation("Kazan")];
      await whenDataLoads();
      await waitFor(() => expect(world.getWriteCount()).toBe(1));
      world.loader.resetLookups();
    });
    When("a minute passes", () => world.runMinuteTick());
    Then("no coordinate lookup was made", thenLookups(0));
  });

  // @add-city-coordinates-to-locations @NFR-P3
  f.Scenario(
    "Presenting the list does the same work",
    ({ Given, When, Then }) => {
      let workWith: ReturnType<typeof countWork>;
      let workWithout: ReturnType<typeof countWork>;
      Given("the list holds Kazan and Moscow with coordinates", () => {
        locations = ["Kazan", "Moscow"].map(withCoordinates);
      });
      When("the list is presented", () => {
        // The formatter cache is keyed by zone: the list without coordinates sits
        // in the zone Europe/Minsk, which no other scenario of this file has warmed.
        const present = (list: typeof locations) => {
          const count = startWorkCount();
          presentBudgetRows(list, { timestamp: BUDGET_FIRST_MOMENT });
          count.stop();
          return countWork(count);
        };
        workWith = present(locations);
        workWithout = present(
          ["Kazan", "Moscow"].map((label) =>
            buildLocation({ label, timeZoneId: TWIN_ZONE_ID }),
          ),
        );
      });

      Then(
        "as many formatters, collators and transition lookups were built as for the same list without coordinates",
        () => {
          expect(workWith.formatters).toBeGreaterThan(0);
          expect(workWith).toEqual(workWithout);
        },
      );
    },
  );
});
