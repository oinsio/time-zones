import type { FeatureDescriibeCallbackParams } from "@amiceli/vitest-cucumber";
import { describeFeature, loadFeature } from "@amiceli/vitest-cucumber";
// "pure" skips auto-cleanup: each step is its own test, the page must survive between steps.
import { act, cleanup, render, screen } from "@testing-library/react/pure";
import i18n from "i18next";
import { createElement } from "react";
import { expect, vi } from "vitest";
import { AppShell } from "@/app";
import { failUpdateCheck, fakeServiceWorker } from "@/test/fakeServiceWorker";
import { registryOverride } from "@/test/registryOverride";

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

const feature = await loadFeature("../main_page_unit.feature");

describeFeature(feature, (f: FeatureDescriibeCallbackParams) => {
  const openApp = async () => {
    render(createElement(AppShell));
    if (!fakeServiceWorker.shouldUpdateCheckFail) return;
    await act(async () => failUpdateCheck());
  };

  const getNoticeRegion = () => screen.getByRole("status");
  const setBrowserConnection = (isOnline: boolean) =>
    act(() => {
      window.dispatchEvent(new Event(isOnline ? "online" : "offline"));
    });
  const emptyStateText = () => i18n.t("views.cardsEmptyState");

  f.BeforeEachScenario(async () => {
    cleanup();
    fakeServiceWorker.isUpdateAvailable = false;
    fakeServiceWorker.shouldUpdateCheckFail = false;
    registryOverride.views = undefined;
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    await i18n.changeLanguage("en");
  });

  f.AfterEachScenario(() => {
    vi.restoreAllMocks();
  });

  f.AfterAllScenarios(() => {
    cleanup();
  });

  // @add-main-page-scaffold @FR1
  f.Scenario("User opens the app", ({ When, Then, And }) => {
    When("the user opens the app", () => openApp());
    Then("the header shows the app title as the only heading", () => {
      expect(screen.getAllByRole("heading")).toHaveLength(1);
      expect(screen.getByRole("banner")).toContainElement(
        screen.getByRole("heading", { level: 1, name: i18n.t("app.title") }),
      );
    });
    And("the content region shows the active view", async () => {
      expect(await screen.findByText(emptyStateText())).toBeInTheDocument();
    });
  });

  // @add-main-page-scaffold @FR1 @FR8
  f.Scenario("Notices stay available", ({ Given, When, Then }) => {
    Given("a new version of the app is waiting", () => {
      fakeServiceWorker.isUpdateAvailable = true;
    });
    When("the user opens the app", () => openApp());
    Then(
      "the update notice is announced politely in the notices region",
      () => {
        expect(getNoticeRegion()).toHaveAttribute("aria-live", "polite");
        expect(getNoticeRegion()).toHaveTextContent(
          i18n.t("app.updateAvailable"),
        );
      },
    );
  });

  // @add-main-page-scaffold @FR1 @UX3
  f.Scenario("Header keeps its position", ({ Given, When, Then, And }) => {
    Given("the update check has failed and storage is unavailable", () => {
      fakeServiceWorker.shouldUpdateCheckFail = true;
      vi.spyOn(localStorage, "setItem").mockImplementation(() => {
        throw new DOMException("quota", "QuotaExceededError");
      });
    });
    When("the user opens the app", () => openApp());
    Then("the notices are out of the document flow", () => {
      expect(getNoticeRegion()).toHaveTextContent(
        i18n.t("mainPage.updateCheckFailed"),
      );
      expect(getNoticeRegion()).toHaveTextContent(
        i18n.t("mainPage.storageUnavailable"),
      );
      expect(getNoticeRegion()).toHaveClass("fixed");
    });
    And("the header is not part of the notices", () => {
      expect(getNoticeRegion()).not.toContainElement(
        screen.getByRole("banner"),
      );
    });
  });

  // @add-main-page-scaffold @FR8 @NFR-A2
  f.Scenario("Update cannot be fetched", ({ Given, When, Then, And }) => {
    Given("the update check fails because the network is unreachable", () => {
      fakeServiceWorker.shouldUpdateCheckFail = true;
    });
    When("the user opens the app", () => openApp());
    Then("the update-check-failed note is announced politely", () => {
      expect(getNoticeRegion()).toHaveAttribute("aria-live", "polite");
      expect(getNoticeRegion()).toHaveTextContent(
        i18n.t("mainPage.updateCheckFailed"),
      );
    });
    And("the view stays usable", async () => {
      expect(await screen.findByText(emptyStateText())).toBeInTheDocument();
    });
  });

  // @add-main-page-scaffold @FR8
  f.Scenario("Offline without a pending check", ({ Given, When, Then }) => {
    Given("the user has opened the app", () => openApp());
    When("the browser goes offline", () => setBrowserConnection(false));
    Then("no note is shown", () => {
      expect(getNoticeRegion()).toBeEmptyDOMElement();
    });
  });

  // @add-main-page-scaffold @FR8
  f.Scenario("Connection restored", ({ Given, When, Then }) => {
    Given("the update check failed and the browser is offline", async () => {
      fakeServiceWorker.shouldUpdateCheckFail = true;
      await openApp();
      setBrowserConnection(false);
    });
    When("the browser goes back online", () => setBrowserConnection(true));
    Then("the update-check-failed note disappears", () => {
      expect(getNoticeRegion()).toBeEmptyDOMElement();
    });
  });

  // @add-main-page-scaffold @FR9 @NFR-A2
  f.Scenario("Private mode", ({ Given, When, Then, And }) => {
    Given("writing to local storage fails", () => {
      vi.spyOn(localStorage, "setItem").mockImplementation(() => {
        throw new DOMException("quota", "QuotaExceededError");
      });
    });
    When("the user opens the app", () => openApp());
    Then("the storage warning is shown", () => {
      expect(getNoticeRegion()).toHaveTextContent(
        i18n.t("mainPage.storageUnavailable"),
      );
    });
    And("the view is still shown", async () => {
      expect(await screen.findByText(emptyStateText())).toBeInTheDocument();
    });
  });

  // @add-main-page-scaffold @FR10
  f.Scenario("Russian user sees the empty state", ({ Given, When, Then }) => {
    Given("the active UI language is ru", async () => {
      await i18n.changeLanguage("ru");
    });
    When("the user opens the app with no locations", () => openApp());
    Then("the empty state explanation is shown in Russian", async () => {
      expect(
        await screen.findByText("Локации пока не добавлены."),
      ).toBeInTheDocument();
    });
  });
});
