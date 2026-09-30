import type { FeatureDescriibeCallbackParams } from "@amiceli/vitest-cucumber";
import { describeFeature, loadFeature } from "@amiceli/vitest-cucumber";
// "pure" skips auto-cleanup: each step is its own test, the page must survive between steps.
import { screen, within } from "@testing-library/react/pure";
import userEvent from "@testing-library/user-event";
import i18n from "i18next";
import { expect, vi } from "vitest";
import { STORAGE_KEYS } from "@/constants";
import {
  closeApp,
  expectEmptyState,
  expectListContains,
  failStorageWrites,
  NOT_JSON,
  openApp,
  searchAndChoose,
  seedStoredList,
  storageWarningText,
} from "./locationsUiWorld";

vi.mock(
  "virtual:pwa-register/react",
  async () =>
    (await import("@/test/fakeServiceWorker")).fakeServiceWorkerModule,
);

const feature = await loadFeature("../locations_storage_ui_unit.feature");
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

  // @add-locations-via-search @FR12
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

  // @add-locations-via-search @FR12
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

  // @add-locations-via-search @FR13
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

  // @add-locations-via-search @FR13
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

  // @add-locations-via-search @FR18
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
