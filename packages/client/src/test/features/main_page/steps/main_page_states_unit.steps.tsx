import type { FeatureDescriibeCallbackParams } from "@amiceli/vitest-cucumber";
import { describeFeature, loadFeature } from "@amiceli/vitest-cucumber";
// "pure" skips auto-cleanup: each step is its own test, the page must survive between steps.
import { cleanup, render, screen, within } from "@testing-library/react/pure";
import userEvent from "@testing-library/user-event";
import i18n from "i18next";
import { createElement } from "react";
import { expect, vi } from "vitest";
import { AppShell } from "@/app";
import { STORAGE_KEYS } from "@/constants";
import { fakeServiceWorker } from "@/test/fakeServiceWorker";
import { registryOverride } from "@/test/registryOverride";
import { stubZoneCitiesFetch } from "@/test/stubZoneCitiesFetch";
import { buildTestView, failingThenLoading } from "@/test/viewFixtures";
import {
  cityEntry,
  storeDocument,
} from "../../locations/steps/locationsPersistenceWorld";

vi.mock(
  "virtual:pwa-register/react",
  async () =>
    (await import("@/test/fakeServiceWorker")).fakeServiceWorkerModule,
);

vi.mock("@/views", async (importOriginal) =>
  (await import("@/test/registryOverride")).withRegistryOverride(
    await importOriginal<typeof import("@/views")>(),
  ),
);

const RESOLVED_TEXT = "loaded view";

const feature = await loadFeature("../main_page_states_unit.feature");

describeFeature(feature, (f: FeatureDescriibeCallbackParams) => {
  const openApp = async () => {
    render(createElement(AppShell));
  };

  f.BeforeEachScenario(async () => {
    cleanup();
    localStorage.clear();
    fakeServiceWorker.isUpdateAvailable = false;
    fakeServiceWorker.shouldUpdateCheckFail = false;
    registryOverride.views = undefined;
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    await i18n.changeLanguage("en");
  });

  f.AfterEachScenario(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  f.AfterAllScenarios(() => {
    cleanup();
  });

  // @add-main-page-scaffold @FR5 @UX1
  f.Scenario("View is loading", ({ Given, When, Then, And }) => {
    Given("the active view has not finished loading", () => {
      registryOverride.views = [
        buildTestView("pending", 0, () => new Promise(() => {})),
      ];
    });
    When("the user opens the app", () => openApp());
    Then("a skeleton is shown in the content region", () => {
      expect(screen.getByRole("main").querySelector("[aria-busy]")).not.toBe(
        null,
      );
    });
    And("the app title is visible", () => {
      expect(screen.getByRole("heading", { level: 1 })).toBeVisible();
    });
  });

  // @add-main-page-scaffold @FR6 @NFR-A2 @UX1
  f.Scenario("View fails", ({ Given, When, Then, And }) => {
    Given("the active view fails to load", () => {
      registryOverride.views = [
        buildTestView(
          "failing",
          0,
          failingThenLoading(() => null, 1),
        ),
      ];
    });
    When("the user opens the app", () => openApp());
    Then("an error message with a Retry action is announced", async () => {
      expect(await screen.findByRole("alert")).toHaveTextContent(
        i18n.t("mainPage.viewError"),
      );
      expect(
        screen.getByRole("button", { name: i18n.t("mainPage.retry") }),
      ).toBeInTheDocument();
    });
    And("the app title stays visible", () => {
      expect(screen.getByRole("heading", { level: 1 })).toBeVisible();
    });
  });

  // @add-main-page-scaffold @FR6
  f.Scenario("User retries", ({ Given, When, Then }) => {
    Given(
      "the active view failed to load and the failure cause is gone",
      async () => {
        registryOverride.views = [
          buildTestView(
            "flaky",
            0,
            failingThenLoading(() => <p>{RESOLVED_TEXT}</p>, 1),
          ),
        ];
        await openApp();
        await screen.findByRole("alert");
      },
    );
    When("the user activates Retry", async () => {
      await userEvent.click(
        screen.getByRole("button", { name: i18n.t("mainPage.retry") }),
      );
    });
    Then("the view is shown", async () => {
      expect(await screen.findByText(RESOLVED_TEXT)).toBeInTheDocument();
    });
  });

  const explanationText = () => i18n.t("views.cardsEmptyState");
  const getAddLocationButtons = () =>
    screen.getAllByRole("button", { name: i18n.t("locations.addLocation") });

  // @add-main-page-scaffold @FR7 @UX1
  // @add-settings-page-and-device-time-location @FR2 @FR13
  f.Scenario("Empty list", ({ Given, When, Then, And }) => {
    Given("the stored location list is empty", () => storeDocument([]));
    When("the user opens the app", () => openApp());
    Then("the explanation is shown in the current language", async () => {
      expect(await screen.findByText(explanationText())).toBeVisible();
    });
    And("no location row is shown", () => {
      expect(screen.queryAllByRole("listitem")).toEqual([]);
    });
    And("the header shows the Add location button", () => {
      expect(
        within(screen.getByRole("banner")).getByRole("button", {
          name: i18n.t("locations.addLocation"),
        }),
      ).toBeVisible();
    });
  });

  // @add-main-page-scaffold @FR7 @UX1
  // @add-settings-page-and-device-time-location @FR13
  f.Scenario("First launch", ({ Given, When, Then, And }) => {
    Given("no location list is stored", () => localStorage.clear());
    When("the user opens the app", () => {
      stubZoneCitiesFetch();
      return openApp();
    });
    Then("the device time location is shown", async () => {
      expect(
        await screen.findByRole("listitem", { name: /Device time$/ }),
      ).toBeVisible();
    });
    And("the explanation is not shown", () => {
      expect(screen.queryByText(explanationText())).not.toBeInTheDocument();
    });
    And("no location list is stored", () => {
      expect(localStorage.getItem(STORAGE_KEYS.LOCATIONS)).toBeNull();
    });
  });

  // @add-settings-page-and-device-time-location @FR13
  f.Scenario("No explanation with locations", ({ Given, When, Then }) => {
    Given("the stored list is the device time location and Moscow", () =>
      storeDocument([cityEntry("Moscow")], { hasDeviceTime: true }),
    );
    When("the user opens the app", () => {
      stubZoneCitiesFetch();
      return openApp();
    });
    Then("the explanation is not shown", async () => {
      await screen.findAllByRole("listitem");
      expect(screen.queryByText(explanationText())).not.toBeInTheDocument();
    });
  });

  // @add-locations-via-search @FR17
  // @add-settings-page-and-device-time-location @FR2
  f.Scenario("Add location from the empty state", ({ Given, When, Then }) => {
    Given("the location list is empty", async () => {
      storeDocument([]);
      stubZoneCitiesFetch();
      await openApp();
    });
    When("the user chooses the header's Add location button", async () => {
      const [headerButton] = getAddLocationButtons();
      await userEvent.click(headerButton);
    });
    Then("the search opens with popular suggestions", async () => {
      expect(
        await screen.findByText(i18n.t("locations.suggestionsHeading")),
      ).toBeVisible();
      expect(screen.getAllByRole("option").length).toBeGreaterThan(0);
    });
  });
});
