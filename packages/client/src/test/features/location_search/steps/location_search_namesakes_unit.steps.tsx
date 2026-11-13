// Verifies FR7, FR8, UX1, UX2, M5 of add-geonames-city-source (D7, D9): namesakes in the search dialog.
import type { FeatureDescriibeCallbackParams } from "@amiceli/vitest-cucumber";
import { describeFeature, loadFeature } from "@amiceli/vitest-cucumber";
import { cleanup, screen } from "@testing-library/react/pure";
import userEvent from "@testing-library/user-event";
import i18n from "i18next";
import { expect } from "vitest";
import { presentSearchResults } from "@/presenter";
import {
  buildChicagoSpringfield,
  buildMoscow,
  openSearchWith,
  optionsNamed,
  readStoredLocations,
  secondaryLineOf,
  typeQuery,
} from "./namesakesWorld";
import { createSearchWorld, runSearch, SAMPLE_QUERIES } from "./searchWorld";

const feature = await loadFeature("../location_search_namesakes_unit.feature");
const SPRINGFIELD = "Springfield";
const SPRINGFIELD_RU = "Спрингфилд";
const SPRINGFIELD_COUNT = 3;

describeFeature(feature, (f: FeatureDescriibeCallbackParams) => {
  const world = createSearchWorld();

  f.AfterEachScenario(async () => {
    cleanup();
    await i18n.changeLanguage("ru");
  });

  const searchFor = async (
    query: string,
    locations = [] as ReturnType<typeof buildMoscow>[],
  ) => {
    await openSearchWith(locations);
    await typeQuery(query);
  };
  const givenLanguage = (code: "en" | "ru") => async () => {
    await i18n.changeLanguage(code);
  };
  const secondaryLines = (cityName: string) =>
    optionsNamed(cityName).map((option) => secondaryLineOf(option, cityName));

  // @add-geonames-city-source @FR7 @UX1 @M5
  f.Scenario("Namesakes are told apart", ({ Given, When, Then, And }) => {
    Given("the interface language is English", givenLanguage("en"));
    When("the user searches for {string}", (_ctx, query: string) =>
      searchFor(query),
    );
    Then("three results are named {string}", (_ctx, cityName: string) => {
      expect(optionsNamed(cityName)).toHaveLength(SPRINGFIELD_COUNT);
    });
    And(
      "their secondary lines are {string}, {string} and {string}, in this order",
      (_ctx, first: string, second: string, third: string) => {
        expect(secondaryLines(SPRINGFIELD)).toEqual([first, second, third]);
      },
    );
  });

  // @add-geonames-city-source @FR7 @UX1
  f.Scenario("The region in Russian", ({ Given, When, Then }) => {
    Given("the interface language is Russian", givenLanguage("ru"));
    When("the user searches for {string}", (_ctx, query: string) =>
      searchFor(query),
    );
    Then(
      "the first result's secondary line is {string}",
      (_ctx, line: string) => {
        expect(secondaryLines(SPRINGFIELD_RU)[0]).toBe(line);
      },
    );
  });

  // @add-geonames-city-source @FR7 @UX2
  f.Scenario("No region without a namesake", ({ Given, When, Then }) => {
    Given("the interface language is English", givenLanguage("en"));
    When("the user searches for {string}", (_ctx, query: string) =>
      searchFor(query),
    );
    Then(
      "the {string} result's secondary line is {string}",
      (_ctx, cityName: string, line: string) => {
        expect(secondaryLines(cityName)).toEqual([line]);
      },
    );
  });

  // @add-geonames-city-source @FR7 @M5
  f.Scenario("No two results look the same", ({ When, Then }) => {
    let textsByQuery: string[][] = [];
    When(
      "each of {int} sample queries is run over the full data",
      (_ctx, sampleCount: number) => {
        expect(SAMPLE_QUERIES).toHaveLength(sampleCount);
        textsByQuery = SAMPLE_QUERIES.map((query) => {
          runSearch(world, query);
          return presentSearchResults(world.results, [], {
            language: "en",
            cityNameLanguage: "en",
            translate: i18n.getFixedT("en"),
          }).map((result) =>
            [result.cityName, result.regionName, result.countryName].join("|"),
          );
        });
      },
    );
    Then(
      "no two results of one query have the same city, region and country text",
      () => {
        for (const texts of textsByQuery) {
          expect(new Set(texts).size).toBe(texts.length);
        }
      },
    );
  });

  // @add-geonames-city-source @FR8
  f.Scenario("Add a GeoNames city", ({ Given, When, Then }) => {
    Given(
      "the interface language is Russian and the list is empty",
      async () => {
        await i18n.changeLanguage("ru");
        await openSearchWith();
      },
    );
    When(
      "the user searches for {string} and chooses it",
      async (_ctx, query: string) => {
        await typeQuery(query);
        await userEvent.click(optionsNamed(query)[0] as HTMLElement);
      },
    );
    Then(
      "the list contains a location in {string} labelled {string} with the country {string}",
      (_ctx, timeZoneId: string, label: string, countryCode: string) => {
        expect(readStoredLocations()).toEqual([
          expect.objectContaining({ timeZoneId, label, countryCode }),
        ]);
      },
    );
  });

  // @add-geonames-city-source @FR8
  f.Scenario("Namesakes in the same zone", ({ Given, When, Then, And }) => {
    Given("the user added Springfield, Missouri, in {string}", async () => {
      await i18n.changeLanguage("en");
    });
    When("the user searches for {string}", (_ctx, query: string) =>
      searchFor(query, [buildChicagoSpringfield()]),
    );
    Then(
      "Springfield, Missouri and Springfield, Illinois are marked as added",
      () => {
        const added = optionsNamed(SPRINGFIELD).filter(
          (option) => option.getAttribute("aria-disabled") === "true",
        );
        expect(
          added.map((option) => secondaryLineOf(option, SPRINGFIELD)),
        ).toEqual([
          expect.stringContaining("Missouri"),
          expect.stringContaining("Illinois"),
        ]);
      },
    );
    And("Springfield, Massachusetts, in {string}, can be chosen", () => {
      const massachusetts = optionsNamed(SPRINGFIELD).find((option) =>
        option.textContent?.includes("Massachusetts"),
      );
      expect(massachusetts).toHaveAttribute("aria-disabled", "false");
    });
  });

  // @add-geonames-city-source @FR8
  f.Scenario(
    "A city and the zone city of its zone are different locations",
    ({ Given, When, Then }) => {
      Given("the list contains Moscow", async () => {
        await i18n.changeLanguage("en");
      });
      When("the user searches for {string}", (_ctx, query: string) =>
        searchFor(query, [buildMoscow()]),
      );
      Then("Kazan is not marked as added and can be chosen", () => {
        expect(optionsNamed("Kazan")[0]).toHaveAttribute(
          "aria-disabled",
          "false",
        );
        expect(
          screen.queryByText(i18n.t("locations.added")),
        ).not.toBeInTheDocument();
      });
    },
  );
});
