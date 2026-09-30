import type { FeatureDescriibeCallbackParams } from "@amiceli/vitest-cucumber";
import { describeFeature, loadFeature } from "@amiceli/vitest-cucumber";
// "pure" skips auto-cleanup: each step is its own test, the page must survive between steps.
import { cleanup, render, screen } from "@testing-library/react/pure";
import i18n from "i18next";
import { createElement } from "react";
import { expect, vi } from "vitest";
import { ViewHost } from "@/app";
import { installResizeObserverFake } from "@/test/resizeObserverFake";
import { buildTextView } from "@/test/viewFixtures";
import { AutoViewMode, type ViewDefinition, viewRegistry } from "@/views";

const NARROW_MIN_WIDTH = 0;
const WIDE_MIN_WIDTH = 768;
const NARROW_TEXT = "narrow view";
const WIDE_TEXT = "wide view";
const TEST_VIEW_TEXT = "test view";
const TEST_VIEW_MIN_WIDTH = 100;
const UNREGISTERED_VIEW_ID = "unregistered" as never;
const WIDE_WIDTH = 1024;
const NARROW_WIDTH = 320;

const feature = await loadFeature("../main_page_view_host_unit.feature");

describeFeature(feature, (f: FeatureDescriibeCallbackParams) => {
  let resizeObserver: ReturnType<typeof installResizeObserverFake>;
  let hostRegistry: readonly ViewDefinition[] = [];

  const twoViews = () => [
    buildTextView("narrow", NARROW_MIN_WIDTH, NARROW_TEXT),
    buildTextView("wide", WIDE_MIN_WIDTH, WIDE_TEXT),
  ];

  const renderHost = (containerWidth: number, mode = AutoViewMode.AUTO) => {
    render(createElement(ViewHost, { registry: hostRegistry, mode }));
    resizeObserver.reportWidth(containerWidth);
  };
  const emptyStateText = () => i18n.t("views.cardsEmptyState");

  f.BeforeEachScenario(async () => {
    cleanup();
    resizeObserver = installResizeObserverFake();
    hostRegistry = [];
    await i18n.changeLanguage("en");
  });

  f.AfterEachScenario(() => {
    vi.unstubAllGlobals();
  });

  f.AfterAllScenarios(() => {
    cleanup();
  });

  // @add-main-page-scaffold @FR2
  f.Scenario("Wide container picks the wider view", ({ Given, When, Then }) => {
    Given("two registered views with minimum widths 0 px and 768 px", () => {
      hostRegistry = twoViews();
    });
    When("the container is 1024 px wide in AUTO mode", () =>
      renderHost(WIDE_WIDTH),
    );
    Then("the view with the 768 px minimum is shown", async () => {
      expect(await screen.findByText(WIDE_TEXT)).toBeInTheDocument();
    });
  });

  // @add-main-page-scaffold @FR2
  f.Scenario(
    "Narrow container picks the narrower view",
    ({ Given, When, Then }) => {
      Given("two registered views with minimum widths 0 px and 768 px", () => {
        hostRegistry = twoViews();
      });
      When("the container is 320 px wide in AUTO mode", () =>
        renderHost(NARROW_WIDTH),
      );
      Then("the view with the 0 px minimum is shown", async () => {
        expect(await screen.findByText(NARROW_TEXT)).toBeInTheDocument();
      });
    },
  );

  // @add-main-page-scaffold @FR2
  f.Scenario("Only one view registered", ({ Given, When, Then }) => {
    Given("only Cards is registered", () => {
      hostRegistry = viewRegistry;
    });
    When("the container is 320 px wide in AUTO mode", () =>
      renderHost(NARROW_WIDTH),
    );
    Then("the Cards view is shown", async () => {
      expect(await screen.findByText(emptyStateText())).toBeInTheDocument();
    });
  });

  // @add-main-page-scaffold @FR2
  f.Scenario("Unknown view id", ({ Given, When, Then }) => {
    Given("two registered views with minimum widths 0 px and 768 px", () => {
      hostRegistry = twoViews();
    });
    When(
      "the mode is a view id that is not registered and the container is 1024 px wide",
      () => renderHost(WIDE_WIDTH, UNREGISTERED_VIEW_ID),
    );
    Then("the view with the 768 px minimum is shown", async () => {
      expect(await screen.findByText(WIDE_TEXT)).toBeInTheDocument();
    });
  });

  // @add-main-page-scaffold @FR4
  f.Scenario("Container is resized", ({ Given, And, When, Then }) => {
    Given("two registered views with minimum widths 0 px and 768 px", () => {
      hostRegistry = twoViews();
    });
    And("the container is 320 px wide in AUTO mode", async () => {
      renderHost(NARROW_WIDTH);
      await screen.findByText(NARROW_TEXT);
    });
    When("the container becomes 1024 px wide", () => {
      resizeObserver.reportWidth(WIDE_WIDTH);
    });
    Then("the view with the 768 px minimum is shown", async () => {
      expect(await screen.findByText(WIDE_TEXT)).toBeInTheDocument();
    });
  });

  // @add-main-page-scaffold @FR3
  f.Scenario("Registry content", ({ When, Then }) => {
    let registeredViews: readonly ViewDefinition[] = [];
    When("the registry is read", () => {
      registeredViews = viewRegistry;
    });
    Then("it contains exactly one view, Cards", () => {
      expect(registeredViews.map((view) => view.titleKey)).toEqual([
        "views.cardsTitle",
      ]);
    });
  });

  // @add-main-page-scaffold @FR2 @M4
  f.Scenario("Second view needs no page change", ({ Given, When, Then }) => {
    Given("a test view is added to the registry", () => {
      hostRegistry = [
        ...viewRegistry,
        buildTextView("test", TEST_VIEW_MIN_WIDTH, TEST_VIEW_TEXT),
      ];
    });
    When("the container is 320 px wide in AUTO mode", () =>
      renderHost(NARROW_WIDTH),
    );
    Then(
      "the host resolves to the test view without any change to the main page",
      async () => {
        expect(await screen.findByText(TEST_VIEW_TEXT)).toBeInTheDocument();
      },
    );
  });
});
