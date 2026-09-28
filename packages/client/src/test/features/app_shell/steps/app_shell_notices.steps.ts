import type { FeatureDescriibeCallbackParams } from "@amiceli/vitest-cucumber";
import { describeFeature, loadFeature } from "@amiceli/vitest-cucumber";
// "pure" skips auto-cleanup: each step is its own test, the app must survive between steps.
import { cleanup, render, screen } from "@testing-library/react/pure";
import userEvent from "@testing-library/user-event";
import i18n from "i18next";
import { createElement, lazy } from "react";
import { expect, type TestContext, vi } from "vitest";
import { AppErrorBoundary, AppShell } from "@/app";
import type { ViewDefinition } from "@/views";

// Fake service worker: real React state behind the useRegisterSW contract.
const fakeServiceWorker = vi.hoisted(() => ({
  isOfflineReady: false,
  isUpdateAvailable: false,
  updateServiceWorker: vi.fn(),
}));
const registeredViews = vi.hoisted((): ViewDefinition[] => []);

vi.mock("virtual:pwa-register/react", async () => {
  const { useState } = await import("react");
  return {
    useRegisterSW: () => ({
      offlineReady: useState(fakeServiceWorker.isOfflineReady),
      needRefresh: useState(fakeServiceWorker.isUpdateAvailable),
      updateServiceWorker: fakeServiceWorker.updateServiceWorker,
    }),
  };
});

vi.mock("@/views", () => ({
  get viewRegistry() {
    return registeredViews;
  },
}));

const FAILURE_DETAILS = "view exploded: undefined is not a function";

const FailingView = () => {
  throw new Error(FAILURE_DETAILS);
};

const failingViewDefinition = {
  id: "failing",
  titleKey: "app.title",
  icon: () => null,
  component: lazy(async () => ({ default: FailingView })),
  autoMinWidth: 0,
} as unknown as ViewDefinition;

const feature = await loadFeature("../app_shell_notices.feature");

describeFeature(feature, (f: FeatureDescriibeCallbackParams) => {
  const reloadPage = vi.fn();

  const openApp = () => {
    render(
      createElement(AppErrorBoundary, {
        reloadPage,
        children: createElement(AppShell),
      }),
    );
  };

  const getNoticeRegion = () => screen.getByRole("status");

  f.BeforeEachScenario(async () => {
    cleanup();
    fakeServiceWorker.isOfflineReady = false;
    fakeServiceWorker.isUpdateAvailable = false;
    fakeServiceWorker.updateServiceWorker.mockReset();
    reloadPage.mockReset();
    registeredViews.length = 0;
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    await i18n.changeLanguage("en");
  });

  f.AfterEachScenario(() => {
    vi.restoreAllMocks();
  });

  f.AfterAllScenarios(() => {
    cleanup();
  });

  // @setup-app-shell-and-pages-deploy @FR2
  f.ScenarioOutline(
    "User sees the app title in their language",
    ({ Given, When, Then, And }, variables) => {
      Given("the active UI language is <language>", async () => {
        await i18n.changeLanguage(variables.language);
      });
      When("the user opens the app", () => openApp());
      Then('the page heading reads "<title>"', () => {
        expect(screen.getByRole("heading", { level: 1 }).textContent).toBe(
          variables.title,
        );
      });
      And('the document title reads "<title>"', () => {
        expect(document.title).toBe(variables.title);
      });
      And("the page language is <language>", () => {
        expect(document.documentElement.lang).toBe(variables.language);
      });
    },
  );

  // @setup-app-shell-and-pages-deploy @FR11
  f.Scenario("Shell with no registered views", ({ Given, When, Then, And }) => {
    Given("no views are registered", () => {
      expect(registeredViews).toHaveLength(0);
    });
    When("the user opens the app", () => openApp());
    Then("only the app title is shown", () => {
      const mainRegion = screen.getByRole("main");
      expect(mainRegion.children).toHaveLength(1);
      expect(mainRegion.textContent).toBe(i18n.t("app.title"));
    });
    And("no error is reported", () => {
      expect(console.error).not.toHaveBeenCalled();
    });
  });

  // @setup-app-shell-and-pages-deploy @FR6
  f.Scenario("App becomes ready to work offline", ({ Given, When, Then }) => {
    Given("the app is ready to work offline for the first time", () => {
      fakeServiceWorker.isOfflineReady = true;
    });
    When("the user opens the app", () => openApp());
    Then("the offline-ready notice is announced politely", () => {
      expect(getNoticeRegion()).toHaveAttribute("aria-live", "polite");
      expect(getNoticeRegion()).toHaveTextContent(i18n.t("app.offlineReady"));
    });
  });

  // @setup-app-shell-and-pages-deploy @FR6
  f.Scenario(
    "User dismisses the offline-ready notice",
    ({ Given, And, When, Then }) => {
      Given("the app is ready to work offline for the first time", () => {
        fakeServiceWorker.isOfflineReady = true;
      });
      And("the user has opened the app", () => openApp());
      When("the user dismisses the notice", async () => {
        await userEvent.click(
          screen.getByRole("button", { name: i18n.t("app.dismiss") }),
        );
      });
      Then("the notice is cleared", () => {
        expect(getNoticeRegion()).toBeEmptyDOMElement();
      });
    },
  );

  // @setup-app-shell-and-pages-deploy @FR7
  f.Scenario("New version becomes available", ({ Given, When, Then, And }) => {
    Given("a new version of the app is waiting", () => {
      fakeServiceWorker.isUpdateAvailable = true;
    });
    When("the user opens the app", () => openApp());
    Then("the update notice is announced politely with a reload action", () => {
      expect(getNoticeRegion()).toHaveAttribute("aria-live", "polite");
      expect(getNoticeRegion()).toHaveTextContent(
        i18n.t("app.updateAvailable"),
      );
      expect(
        screen.getByRole("button", { name: i18n.t("app.reload") }),
      ).toBeInTheDocument();
    });
    And("the app has not reloaded by itself", () => {
      expect(fakeServiceWorker.updateServiceWorker).not.toHaveBeenCalled();
    });
  });

  // @setup-app-shell-and-pages-deploy @FR7
  f.Scenario("User accepts the update", ({ Given, And, When, Then }) => {
    Given("a new version of the app is waiting", () => {
      fakeServiceWorker.isUpdateAvailable = true;
    });
    And("the user has opened the app", () => openApp());
    When("the user chooses to reload into the new version", async () => {
      await userEvent.click(
        screen.getByRole("button", { name: i18n.t("app.reload") }),
      );
    });
    Then("the app switches to the new version", () => {
      expect(fakeServiceWorker.updateServiceWorker).toHaveBeenCalledWith(true);
    });
  });

  // @setup-app-shell-and-pages-deploy @FR7
  f.Scenario("User postpones the update", ({ Given, And, When, Then }) => {
    Given("a new version of the app is waiting", () => {
      fakeServiceWorker.isUpdateAvailable = true;
    });
    And("the user has opened the app", () => openApp());
    When("the user dismisses the notice", async () => {
      await userEvent.click(
        screen.getByRole("button", { name: i18n.t("app.dismiss") }),
      );
    });
    Then("the notice is cleared", () => {
      expect(getNoticeRegion()).toBeEmptyDOMElement();
    });
    And("the app has not reloaded by itself", () => {
      expect(fakeServiceWorker.updateServiceWorker).not.toHaveBeenCalled();
    });
  });

  // @setup-app-shell-and-pages-deploy @FR7 @NFR-A2
  f.Scenario(
    "User postpones the update from the keyboard",
    ({ Given, And, When, Then }) => {
      Given("a new version of the app is waiting", () => {
        fakeServiceWorker.isUpdateAvailable = true;
      });
      And("the user has opened the app", () => openApp());
      When("the user presses Escape", async () => {
        await userEvent.keyboard("{Escape}");
      });
      Then("the notice is cleared", () => {
        expect(getNoticeRegion()).toBeEmptyDOMElement();
      });
    },
  );

  // @setup-app-shell-and-pages-deploy @FR8
  f.Scenario(
    "A part of the page fails to render",
    ({ Given, When, Then, And }) => {
      Given("a part of the page fails to render", () => {
        registeredViews.push(failingViewDefinition);
      });
      When("the user opens the app", () => openApp());
      Then(
        "the recovery screen explains the problem in plain language",
        async (_ctx: TestContext) => {
          const recoveryHeading = await screen.findByRole("heading", {
            name: i18n.t("app.errorTitle"),
          });
          expect(recoveryHeading).toBeInTheDocument();
          expect(screen.getByText(i18n.t("app.errorMessage"))).toBeVisible();
          expect(document.body).not.toHaveTextContent(FAILURE_DETAILS);
        },
      );
      And("it offers a reload action", () => {
        expect(
          screen.getByRole("button", { name: i18n.t("app.reload") }),
        ).toBeInTheDocument();
      });
    },
  );

  // @setup-app-shell-and-pages-deploy @FR8
  f.Scenario("User recovers by reloading", ({ Given, And, When, Then }) => {
    Given("a part of the page fails to render", () => {
      registeredViews.push(failingViewDefinition);
    });
    And("the user has opened the app", () => openApp());
    When("the user chooses to reload the app", async () => {
      await userEvent.click(
        await screen.findByRole("button", { name: i18n.t("app.reload") }),
      );
    });
    Then("the app is loaded again", () => {
      expect(reloadPage).toHaveBeenCalledTimes(1);
    });
  });
});
