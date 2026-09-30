import type { FeatureDescriibeCallbackParams } from "@amiceli/vitest-cucumber";
import { describeFeature, loadFeature } from "@amiceli/vitest-cucumber";
// "pure" skips auto-cleanup: each step is its own test, the page must survive between steps.
import { screen, within } from "@testing-library/react/pure";
import userEvent from "@testing-library/user-event";
import i18n from "i18next";
import { expect, vi } from "vitest";
import { STORAGE_KEYS } from "@/constants";
import {
  chooseCity,
  closeApp,
  expectEmptyState,
  expectListContains,
  expectSuggestions,
  failStorageWrites,
  NOT_JSON,
  openApp,
  openSearch,
  removeCity,
  searchAndChoose,
  seedStoredList,
  storageWarningText,
  typeInSearch,
} from "./locationsUiWorld";

vi.mock(
  "virtual:pwa-register/react",
  async () =>
    (await import("@/test/fakeServiceWorker")).fakeServiceWorkerModule,
);

const feature = await loadFeature("../locations_ui_unit.feature");
const EMPTY_STATE_STEP =
  'the empty state with the "Add location" action is shown';
const USER_OPENED_APP_STEP = "the user opened the app";
const SEARCH_AND_CHOOSE_STEP =
  "the user searches for {string} and chooses {string}";

describeFeature(feature, (f: FeatureDescriibeCallbackParams) => {
  const storeList = (_ctx: unknown, ...cities: string[]) =>
    seedStoredList(cities);
  const storeCorruptedList = () =>
    localStorage.setItem(STORAGE_KEYS.LOCATIONS, NOT_JSON);
  const useLanguage = (language: string) => async () => {
    await i18n.changeLanguage(language);
  };

  f.BeforeEachScenario(async () => {
    closeApp();
    await i18n.changeLanguage("en");
  });
  f.AfterEachScenario(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });
  f.AfterAllScenarios(() => closeApp());

  f.Scenario("Rows show city and country", ({ Given, And, When, Then }) => {
    Given("the interface language is English", useLanguage("en"));
    And("the stored list is {string}, {string}", storeList);
    When("the user opens the app", () => openApp());
    Then(
      "the rows are {string} with {string} and {string} with {string}",
      (
        _ctx,
        firstCity: string,
        firstCountry: string,
        secondCity: string,
        secondCountry: string,
      ) => {
        const [firstRow, secondRow] = screen.getAllByRole("listitem");
        expect(firstRow).toHaveTextContent(`${firstCity}${firstCountry}`);
        expect(secondRow).toHaveTextContent(`${secondCity}${secondCountry}`);
      },
    );
  });

  f.Scenario(
    "Empty state after the last removal",
    ({ Given, And, When, Then }) => {
      Given("the stored list is {string}", storeList);
      And(USER_OPENED_APP_STEP, () => openApp());
      When("the user removes {string}", (_ctx, city: string) =>
        removeCity(city),
      );
      Then(EMPTY_STATE_STEP, expectEmptyState);
    },
  );

  f.Scenario("Search opened", ({ Given, When, Then }) => {
    Given(USER_OPENED_APP_STEP, () => openApp());
    When("the user opens the search", () => openSearch());
    Then("popular locations are shown as suggestions", expectSuggestions);
  });

  f.Scenario("Add from results", ({ Given, When, Then, And }) => {
    Given(USER_OPENED_APP_STEP, () => openApp());
    When(SEARCH_AND_CHOOSE_STEP, (_ctx, query: string, city: string) =>
      searchAndChoose(query, city),
    );
    Then("the search is closed", () => {
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });
    And("the list contains {string}", (_ctx, city: string) =>
      expectListContains(city),
    );
  });

  f.Scenario("Already added", ({ Given, And, When, Then }) => {
    Given("the stored list is {string}", storeList);
    And(USER_OPENED_APP_STEP, () => openApp());
    When("the user searches for {string}", (_ctx, query: string) =>
      typeInSearch(query),
    );
    Then(
      "{string} is marked as added and cannot be chosen",
      async (_ctx, city: string) => {
        const option = screen.getByRole("option", { name: new RegExp(city) });
        expect(option).toHaveTextContent(i18n.t("locations.added"));
        await chooseCity(city);
        expect(screen.getByRole("dialog")).toBeInTheDocument();
        expect(screen.getAllByRole("listitem", { hidden: true })).toHaveLength(
          1,
        );
      },
    );
  });

  f.Scenario("Results follow typing", ({ Given, When, Then }) => {
    const resultsAfterEachCharacter: string[] = [];
    Given(USER_OPENED_APP_STEP, () => openApp());
    When(
      "the user types {string} one character at a time",
      async (_ctx, query: string) => {
        await openSearch();
        for (const character of query) {
          await userEvent.type(screen.getByRole("combobox"), character);
          resultsAfterEachCharacter.push(
            screen
              .getAllByRole("option")
              .map((option) => option.textContent)
              .join("|"),
          );
        }
      },
    );
    Then("the results change after each character", () => {
      expect(new Set(resultsAfterEachCharacter).size).toBe(
        resultsAfterEachCharacter.length,
      );
    });
  });

  f.Scenario("Query cleared", ({ Given, And, When, Then }) => {
    Given(USER_OPENED_APP_STEP, () => openApp());
    And("the user typed {string} in the search", (_ctx, query: string) =>
      typeInSearch(query),
    );
    When("the user clears the query", () =>
      userEvent.clear(screen.getByRole("combobox")),
    );
    Then("popular locations are shown as suggestions", expectSuggestions);
  });

  f.Scenario("Nothing found", ({ Given, When, Then }) => {
    Given(USER_OPENED_APP_STEP, () => openApp());
    When("the user searches for {string}", (_ctx, query: string) =>
      typeInSearch(query),
    );
    Then("the no-results message and the hint are shown", () => {
      expect(screen.getByText(i18n.t("locations.noResults"))).toBeVisible();
      expect(screen.getByText(i18n.t("locations.noResultsHint"))).toBeVisible();
    });
  });

  f.Scenario("Corrupted document", ({ Given, When, Then }) => {
    Given("the stored list is not valid JSON", storeCorruptedList);
    When("the user opens the app", () => openApp());
    Then("an error message with a reset action is shown", () => {
      const alert = screen.getByRole("alert");
      expect(alert).toHaveTextContent(i18n.t("locations.loadError"));
      expect(
        within(alert).getByRole("button", { name: i18n.t("locations.reset") }),
      ).toBeVisible();
    });
  });

  f.Scenario("Reset", ({ Given, And, When, Then }) => {
    Given("the stored list is not valid JSON", storeCorruptedList);
    And(USER_OPENED_APP_STEP, () => openApp());
    When("the user resets the list", () =>
      userEvent.click(
        screen.getByRole("button", { name: i18n.t("locations.reset") }),
      ),
    );
    Then(EMPTY_STATE_STEP, expectEmptyState);
    And("no list document is stored", () => {
      expect(localStorage.getItem(STORAGE_KEYS.LOCATIONS)).toBeNull();
    });
  });

  f.Scenario("Private mode", ({ Given, And, When, Then }) => {
    Given("writing to storage fails", () => failStorageWrites(() => true));
    And(USER_OPENED_APP_STEP, () => openApp());
    When(SEARCH_AND_CHOOSE_STEP, (_ctx, query: string, city: string) =>
      searchAndChoose(query, city),
    );
    Then("the list contains {string}", (_ctx, city: string) =>
      expectListContains(city),
    );
    And("the storage warning is shown", () => {
      expect(screen.getByText(storageWarningText())).toBeVisible();
    });
  });

  f.Scenario("Saving the list fails later", ({ Given, And, When, Then }) => {
    Given("only saving the list fails", () =>
      failStorageWrites((key) => key === STORAGE_KEYS.LOCATIONS),
    );
    And(USER_OPENED_APP_STEP, () => openApp());
    And("no storage warning is shown", () => {
      expect(screen.queryByText(storageWarningText())).not.toBeInTheDocument();
    });
    When(SEARCH_AND_CHOOSE_STEP, (_ctx, query: string, city: string) =>
      searchAndChoose(query, city),
    );
    Then("the list contains {string}", (_ctx, city: string) =>
      expectListContains(city),
    );
    And("the storage warning is shown", async () => {
      expect(await screen.findByText(storageWarningText())).toBeVisible();
    });
  });

  f.Scenario("Russian interface", ({ Given, And, When, Then }) => {
    Given("the interface language is Russian", useLanguage("ru"));
    And("the stored list is {string}", storeList);
    When("the user opens the app", () => openApp());
    Then("the row shows {string}", (_ctx, country: string) => {
      expect(screen.getByRole("listitem")).toHaveTextContent(country);
    });
    And('the "Add location" action reads in Russian', () => {
      expect(
        screen.getByRole("button", { name: "Добавить место" }),
      ).toBeVisible();
    });
  });
});
