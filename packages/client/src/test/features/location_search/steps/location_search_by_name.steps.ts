import zoneCities from "virtual:zone-cities";
import type {
  FeatureDescriibeCallbackParams,
  StepTest,
} from "@amiceli/vitest-cucumber";
import { describeFeature, loadFeature } from "@amiceli/vitest-cucumber";
import { expect } from "vitest";
import { ETC_ZONE_AREA } from "@/lib/zoneRules";
import { fullCityData } from "@/test/fullCityData";
import { committedRelease } from "@/test/installZoneRules";
import { startOnStaleEngine, stopStaleEngine } from "@/test/staleEngineWorld";
import {
  buildCitySearch,
  cityNamesOf,
  createSearchWorld,
  runSearch,
  zoneIdsOf,
} from "./searchWorld";

const supportedValuesOfBefore = Object.getOwnPropertyDescriptor(
  Intl,
  "supportedValuesOf",
) as PropertyDescriptor;

const feature = await loadFeature("../location_search_by_name.feature");

describeFeature(feature, (f: FeatureDescriibeCallbackParams) => {
  const world = createSearchWorld();

  f.BeforeEachScenario(() => {
    Object.assign(world, createSearchWorld());
  });

  const whenUserSearches = ({ When }: Pick<StepTest, "When">) =>
    When("the user searches for {string}", (_ctx: unknown, query: string) =>
      runSearch(world, query),
    );

  // @add-locations-via-search @FR1
  f.Scenario("Diacritics are ignored", ({ When, Then }) => {
    whenUserSearches({ When });
    Then("{string} is among the results", (_ctx, name: string) => {
      expect(cityNamesOf(world)).toContain(name);
    });
  });

  // @add-locations-via-search @FR1
  f.Scenario("Other language than the interface", ({ Given, When, Then }) => {
    Given("the interface language is English", () => {
      world.language = "en";
    });
    whenUserSearches({ When });
    Then(
      "the first result is {string} shown as {string}",
      (_ctx, _city: string, shownName: string) => {
        expect(cityNamesOf(world)[0]).toBe(shownName);
        expect(zoneIdsOf(world)[0]).toBe("Europe/Moscow");
      },
    );
  });

  // @add-locations-via-search @FR1
  f.Scenario("Case and spaces", ({ When, Then }) => {
    whenUserSearches({ When });
    Then("the first result is in {string}", (_ctx, zoneId: string) => {
      expect(zoneIdsOf(world)[0]).toBe(zoneId);
    });
  });

  // @add-locations-via-search @FR2
  f.Scenario("Full city name", ({ When, Then }) => {
    whenUserSearches({ When });
    Then("the first result is in {string}", (_ctx, zoneId: string) => {
      expect(zoneIdsOf(world)[0]).toBe(zoneId);
    });
  });

  // @add-locations-via-search @FR2
  f.Scenario("Later word of the name", ({ When, Then }) => {
    whenUserSearches({ When });
    Then("{string} is among the results", (_ctx, name: string) => {
      expect(cityNamesOf(world)).toContain(name);
    });
  });

  // @add-locations-via-search @FR2
  f.Scenario("Prefix of the name", ({ When, Then }) => {
    whenUserSearches({ When });
    Then("{string} is among the results", (_ctx, name: string) => {
      expect(cityNamesOf(world)).toContain(name);
    });
  });

  f.AfterEachScenario(() => {
    stopStaleEngine();
    Object.defineProperty(Intl, "supportedValuesOf", supportedValuesOfBefore);
  });

  // @add-zone-rules-from-iana @FR5 @FR9
  f.Scenario(
    "A zone the engine rejects is offered",
    ({ Given, When, Then }) => {
      let search: ReturnType<typeof buildCitySearch>;
      Given("the engine rejects {string}", async (_ctx, zoneId: string) => {
        const { modules } = await startOnStaleEngine({
          staleZones: {},
          rejectedZones: [zoneId],
        });
        search = modules.adapters.createCompositeCitySearch(
          zoneCities,
          fullCityData,
        );
      });
      When("the user searches for {string}", (_ctx, query: string) => {
        world.citySearch = search;
        runSearch(world, query);
      });
      Then(
        "Ciudad Juárez in {string} is among the results",
        (_ctx, zoneId: string) => {
          expect(cityNamesOf(world)).toContain("Ciudad Juárez");
          expect(zoneIdsOf(world)).toContain(zoneId);
        },
      );
    },
  );

  // @add-zone-rules-from-iana @FR9
  f.Scenario("The engine's own list plays no part", ({ Given, When, Then }) => {
    Given("the engine cannot list its zones", () => {
      Object.defineProperty(Intl, "supportedValuesOf", {
        ...supportedValuesOfBefore,
        value: undefined,
      });
      world.citySearch = buildCitySearch();
    });
    whenUserSearches({ When });
    Then("Moscow in {string} is among the results", (_ctx, zoneId: string) => {
      expect(cityNamesOf(world)).toContain("Moscow");
      expect(zoneIdsOf(world)).toContain(zoneId);
    });
  });

  // @add-zone-rules-from-iana @FR9 @UX2
  f.Scenario(
    "Offset-only zones are not offered",
    ({ Given, When, Then, And }) => {
      Given(
        "the zone rules release holds {string}, {string} and {string}",
        (_ctx: unknown, ...zoneIds: string[]) => {
          for (const zoneId of zoneIds) {
            expect(committedRelease.zones.has(zoneId)).toBe(true);
          }
        },
      );
      whenUserSearches({ When });
      Then(
        "no result has a zone in the {string} area",
        (_ctx, area: string) => {
          expect(area).toBe(ETC_ZONE_AREA);
          expect(
            zoneIdsOf(world).filter((id) => id.startsWith(`${area}/`)),
          ).toEqual([]);
        },
      );
      And(
        "no result has an area-less zone other than {string}",
        (_ctx, utcZoneId: string) => {
          expect(
            zoneIdsOf(world).filter(
              (id) => !id.includes("/") && id !== utcZoneId,
            ),
          ).toEqual([]);
        },
      );
    },
  );
});
