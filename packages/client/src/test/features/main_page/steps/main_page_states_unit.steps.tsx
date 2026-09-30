import type { FeatureDescriibeCallbackParams } from "@amiceli/vitest-cucumber";
import { describeFeature, loadFeature } from "@amiceli/vitest-cucumber";
// "pure" skips auto-cleanup: each step is its own test, the page must survive between steps.
import { cleanup, render, screen } from "@testing-library/react/pure";
import userEvent from "@testing-library/user-event";
import i18n from "i18next";
import { createElement } from "react";
import { expect, vi } from "vitest";
import { AppShell } from "@/app";
import { fakeServiceWorker } from "@/test/fakeServiceWorker";
import { stubZoneCitiesFetch } from "@/test/stubZoneCitiesFetch";
import { registryOverride } from "@/test/registryOverride";
import { buildTestView, failingThenLoading } from "@/test/viewFixtures";

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

  // @add-main-page-scaffold @FR7 @UX1
  f.Scenario("First launch", ({ Given, When, Then, And }) => {
    Given("the active UI language is en", async () => {
      await i18n.changeLanguage("en");
    });
    When("the user opens the app with no locations", () => openApp());
    Then(
      "the empty state explanation is shown in the current language",
      async () => {
        expect(
          await screen.findByText("No locations added yet."),
        ).toBeInTheDocument();
      },
    );
    And('the "Add location" action is offered', () => {
      expect(screen.getByRole("button")).toHaveTextContent(
        i18n.t("locations.addLocation"),
      );
    });
  });

  // @add-locations-via-search @FR17
  f.Scenario("Add location from the empty state", ({ Given, And, When, Then }) => {
    Given("the active UI language is en", async () => {
      await i18n.changeLanguage("en");
    });
    And("the app is open with no locations", async () => {
      stubZoneCitiesFetch();
      await openApp();
    });
    When("the user adds Moscow from the search", async () => {
      await userEvent.click(
        screen.getByRole("button", { name: i18n.t("locations.addLocation") }),
      );
      await userEvent.type(await screen.findByRole("combobox"), "Moscow");
      await userEvent.click(screen.getByRole("option", { name: /Moscow/ }));
    });
    Then("Moscow is in the list", () => {
      expect(screen.getByRole("listitem")).toHaveTextContent("Moscow");
    });
    And("the empty state explanation is gone", () => {
      expect(
        screen.queryByText("No locations added yet."),
      ).not.toBeInTheDocument();
    });
  });
});
