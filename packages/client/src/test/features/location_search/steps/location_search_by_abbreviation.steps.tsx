// Verifies FR8–FR11, FR15, UX3, M2, M3 of show-zone-abbreviations-and-zone-label-setting.
import type {
  FeatureDescriibeCallbackParams,
  StepTest,
} from "@amiceli/vitest-cucumber";
import { describeFeature, loadFeature } from "@amiceli/vitest-cucumber";
import { cleanup, renderHook, waitFor } from "@testing-library/react/pure";
import i18n from "i18next";
import type { ReactNode } from "react";
import { expect } from "vitest";
import { createInMemoryPreferencesRepository } from "@/adapters";
import type { CityNameLanguage } from "@/constants";
import { PreferencesProvider, useCitySearch } from "@/controller";
import { PreferencesLoadStatus, SearchMatchKind } from "@/ports";
import { DEFAULT_PREFERENCES, type ZoneLabelPart } from "@/preferences";
import { type PresentedSearchResult, presentSearchResults } from "@/presenter";
import { createManualWriteScheduler } from "@/test/writeSchedulers";
import {
  buildCitySearch,
  cityNamesOf,
  createSearchWorld,
  runSearch,
  zoneIdsOf,
} from "./searchWorld";

const feature = await loadFeature("../location_search_by_abbreviation.feature");

const LEADING_RESULTS_COUNT = 3;
const PAIR_SEPARATOR = " / ";
const NO_ZONE_LABEL_PARTS: readonly ZoneLabelPart[] = [];

describeFeature(feature, (f: FeatureDescriibeCallbackParams) => {
  const world = createSearchWorld();
  let zoneLabelParts: readonly ZoneLabelPart[] =
    DEFAULT_PREFERENCES.zoneLabelParts;

  f.BeforeEachScenario(async () => {
    Object.assign(world, createSearchWorld());
    zoneLabelParts = DEFAULT_PREFERENCES.zoneLabelParts;
    await i18n.changeLanguage("en");
  });
  f.AfterAllScenarios(async () => {
    cleanup();
    await i18n.changeLanguage("ru");
  });

  const present = (): PresentedSearchResult[] =>
    presentSearchResults(world.results, [], {
      language: world.language,
      cityNameLanguage: world.language,
      translate: i18n.getFixedT(world.language),
    });
  const abbreviationResults = () =>
    world.results.filter(
      (result) => result.matchKind === SearchMatchKind.ABBREVIATION,
    );
  const cityNamesByAbbreviation = () =>
    abbreviationResults().map((result) => result.record.names[world.language]);
  const presentedOf = (city: string) => {
    const presented = present().find((result) => result.cityName === city);
    expect(presented).toBeDefined();
    return presented as PresentedSearchResult;
  };
  const pairTextOf = (presented: PresentedSearchResult) =>
    (presented.abbreviationPair ?? [])
      .map(({ text }) => text)
      .join(PAIR_SEPARATOR);
  const emphasisedOf = (presented: PresentedSearchResult) =>
    (presented.abbreviationPair ?? [])
      .filter(({ isMatched }) => isMatched)
      .map(({ text }) => text);

  const whenUserSearches = ({ When }: Pick<StepTest, "When">) =>
    When("the user searches for {string}", (_ctx: unknown, query: string) =>
      runSearch(world, query),
    );
  const thenNoAbbreviationMatch = () =>
    expect(abbreviationResults()).toEqual([]);

  // @show-zone-abbreviations-and-zone-label-setting @FR8 @FR11 @M2
  f.Scenario("Ambiguous abbreviation", ({ When, Then }) => {
    whenUserSearches({ When });
    Then(
      "exactly three results match by abbreviation: {string}, {string} and {string}",
      (_ctx: unknown, ...cities: string[]) =>
        expect(cityNamesByAbbreviation()).toEqual(cities),
    );
  });

  // @show-zone-abbreviations-and-zone-label-setting @FR9 @FR10 @M2
  f.Scenario("Single-zone abbreviation", ({ When, Then }) => {
    whenUserSearches({ When });
    Then(
      "the first result is {string} and it shows {string}",
      (_ctx, city: string, pair: string) => {
        expect(cityNamesOf(world)[0]).toBe(city);
        expect(pairTextOf(present()[0] as PresentedSearchResult)).toBe(pair);
      },
    );
  });

  // @show-zone-abbreviations-and-zone-label-setting @FR9
  f.Scenario("Either half of the year", ({ When, Then }) => {
    whenUserSearches({ When });
    Then(
      "the first result is {string} and it matches by abbreviation",
      (_ctx, city: string) => {
        expect(cityNamesOf(world)[0]).toBe(city);
        expect(world.results[0]?.matchKind).toBe(SearchMatchKind.ABBREVIATION);
      },
    );
  });

  // @show-zone-abbreviations-and-zone-label-setting @FR9
  f.Scenario("Zones without a clock change", ({ When, Then }) => {
    whenUserSearches({ When });
    Then("{string} matches by abbreviation", (_ctx, city: string) =>
      expect(cityNamesByAbbreviation()).toContain(city),
    );
  });

  // @show-zone-abbreviations-and-zone-label-setting @FR8 @M3
  f.ScenarioOutline(
    "Abbreviations outside tzdb no longer match",
    ({ When, Then }, variables) => {
      When('the user searches for "<query>"', () =>
        runSearch(world, variables.query),
      );
      Then("no result matches by abbreviation", thenNoAbbreviationMatch);
    },
  );

  // @show-zone-abbreviations-and-zone-label-setting @FR8 @M3
  f.ScenarioOutline(
    "Zones that tzdb names otherwise are no longer found",
    ({ When, Then, And }, variables) => {
      When('the user searches for "<query>"', () =>
        runSearch(world, variables.query),
      );
      Then('"<kept>" matches by abbreviation', () =>
        expect(cityNamesByAbbreviation()).toContain(variables.kept),
      );
      And('"<dropped>" does not match by abbreviation', () =>
        expect(cityNamesByAbbreviation()).not.toContain(variables.dropped),
      );
    },
  );

  // @show-zone-abbreviations-and-zone-label-setting @FR8
  f.Scenario(
    "Partial abbreviation does not match by abbreviation",
    ({ When, Then }) => {
      whenUserSearches({ When });
      Then("no result shows an abbreviation", () => {
        expect(
          present().filter((result) => result.abbreviationPair !== undefined),
        ).toEqual([]);
      });
    },
  );

  // @show-zone-abbreviations-and-zone-label-setting @FR15
  f.Scenario(
    "The zone label does not change the search",
    ({ Given, When, Then, And }) => {
      let queryRun = "";
      const searchWithZoneLabel = async (parts: readonly ZoneLabelPart[]) => {
        const { result } = renderHook(
          () => useCitySearch(() => Promise.resolve(buildCitySearch())),
          {
            wrapper: ({ children }: { children: ReactNode }) => (
              <PreferencesProvider
                repository={createInMemoryPreferencesRepository({
                  initialDocument: {
                    status: PreferencesLoadStatus.LOADED,
                    preferences: {
                      ...DEFAULT_PREFERENCES,
                      zoneLabelParts: parts,
                    },
                  },
                })}
                writeScheduler={createManualWriteScheduler()}
              >
                {children}
              </PreferencesProvider>
            ),
          },
        );
        await waitFor(() =>
          expect(
            result.current.presentResults(queryRun, []).length,
          ).toBeGreaterThan(0),
        );
        return result.current.presentResults(queryRun, []);
      };
      let resultsWithoutParts: PresentedSearchResult[] = [];
      let resultsWithBoth: PresentedSearchResult[] = [];
      Given(
        "the zone label shows neither the zone abbreviation nor the UTC offset",
        () => {
          zoneLabelParts = NO_ZONE_LABEL_PARTS;
        },
      );
      When("the user searches for {string}", async (_ctx, query: string) => {
        queryRun = query;
        resultsWithoutParts = await searchWithZoneLabel(zoneLabelParts);
        resultsWithBoth = await searchWithZoneLabel(
          DEFAULT_PREFERENCES.zoneLabelParts,
        );
      });
      Then("the results are the same as with both shown", () =>
        expect(resultsWithoutParts).toEqual(resultsWithBoth),
      );
      And("each abbreviation result shows its abbreviation pair", () => {
        const withPair = resultsWithoutParts.filter(
          (result) => result.abbreviationPair !== undefined,
        );
        expect(withPair).toHaveLength(LEADING_RESULTS_COUNT);
        for (const result of withPair) {
          expect(result.abbreviationPair?.length).toBeGreaterThan(0);
        }
      });
    },
  );

  // @show-zone-abbreviations-and-zone-label-setting @FR10 @FR11 @UX3 @M2
  f.Scenario(
    "Ambiguous abbreviation with its pairs",
    ({ Given, When, Then, And }) => {
      Given("the interface language is {string}", (_ctx, language: string) => {
        world.language = language as CityNameLanguage;
      });
      whenUserSearches({ When });
      Then(
        "the first three results are {string} with {string}, {string} with {string} and {string} with {string}, in that order",
        (_ctx: unknown, ...expected: string[]) => {
          const leading = present().slice(0, LEADING_RESULTS_COUNT);
          expect(
            leading.flatMap((result) => [result.cityName, pairTextOf(result)]),
          ).toEqual(expected);
        },
      );
      And(
        "{string} is the emphasised abbreviation in each of them",
        (_ctx, abbreviation: string) => {
          for (const result of present().slice(0, LEADING_RESULTS_COUNT)) {
            expect(emphasisedOf(result)).toEqual([abbreviation]);
          }
        },
      );
      And("{int} results are announced", (_ctx, count: number) =>
        expect(zoneIdsOf(world)).toHaveLength(count),
      );
    },
  );

  // @show-zone-abbreviations-and-zone-label-setting @FR10 @UX3
  f.Scenario(
    "The matched half of a pair is emphasised",
    ({ When, Then, And }) => {
      const expectResult = (
        _ctx: unknown,
        city: string,
        pair: string,
        emphasised: string,
      ) => {
        expect(pairTextOf(presentedOf(city))).toBe(pair);
        expect(emphasisedOf(presentedOf(city))).toEqual([emphasised]);
      };
      When('the user searches for "EDT"', () => runSearch(world, "EDT"));
      Then(
        'the "New York" result shows "EST / EDT" with "EDT" emphasised',
        () => expectResult(undefined, "New York", "EST / EDT", "EDT"),
      );
      When('the user searches for "EST"', () => runSearch(world, "EST"));
      Then(
        'the "New York" result shows "EST / EDT" with "EST" emphasised',
        () => expectResult(undefined, "New York", "EST / EDT", "EST"),
      );
      And('the "Panama" result shows "EST" alone', () =>
        expect(pairTextOf(presentedOf("Panama"))).toBe("EST"),
      );
    },
  );

  // @show-zone-abbreviations-and-zone-label-setting @FR10 @UX3
  f.Scenario("Russian spelling in the result", ({ Given, When, Then }) => {
    Given(
      "the interface language is {string}",
      async (_ctx, language: string) => {
        world.language = language as CityNameLanguage;
        await i18n.changeLanguage(language);
      },
    );
    whenUserSearches({ When });
    Then(
      "the {string} result shows {string} emphasised",
      (_ctx, city: string, abbreviation: string) => {
        expect(pairTextOf(presentedOf(city))).toBe(abbreviation);
        expect(emphasisedOf(presentedOf(city))).toEqual([abbreviation]);
      },
    );
  });
});
