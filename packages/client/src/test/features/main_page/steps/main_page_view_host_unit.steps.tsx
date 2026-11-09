import type { FeatureDescriibeCallbackParams } from "@amiceli/vitest-cucumber";
import { describeFeature, loadFeature } from "@amiceli/vitest-cucumber";
// "pure" skips auto-cleanup: each step is its own test, the page must survive between steps.
import { act, cleanup, render, screen } from "@testing-library/react/pure";
import i18n from "i18next";
import { createElement } from "react";
import { expect, vi } from "vitest";
import {
  createInMemoryLocationRepository,
  createInMemoryPreferencesBackend,
  createInMemoryPreferencesRepository,
} from "@/adapters";
import { ViewHost } from "@/app";
import { LocationsProvider, PreferencesProvider } from "@/controller";
import { PreferencesLoadStatus } from "@/ports";
import { DEFAULT_PREFERENCES } from "@/preferences";
import { installResizeObserverFake } from "@/test/resizeObserverFake";
import { buildTestView, buildTextView } from "@/test/viewFixtures";
import { createManualWriteScheduler } from "@/test/writeSchedulers";
import { type ViewDefinition, ViewId, viewRegistry } from "@/views";

const CARDS_TEXT = "cards view";
const GRID_TEXT = "grid view";
const TEST_VIEW_ID = "test";
const TEST_VIEW_TEXT = "test view";
const UNREGISTERED_VIEW_ID = "timeline";
const NARROW_WIDTH = 320;
const WIDE_WIDTH = 2560;
const VIEW_ID_ATTRIBUTE = "data-view-id";

const feature = await loadFeature("../main_page_view_host_unit.feature");

describeFeature(feature, (f: FeatureDescriibeCallbackParams) => {
  let resizeObserver: ReturnType<typeof installResizeObserverFake>;
  let hostRegistry: readonly ViewDefinition[] = [];
  let backend = createInMemoryPreferencesBackend();
  let gridLoader = vi.fn();

  const buildRegistry = () => [
    buildTextView(ViewId.CARDS, CARDS_TEXT),
    buildTestView(ViewId.GRID, async () => {
      gridLoader();
      return () => <p>{GRID_TEXT}</p>;
    }),
  ];

  const renderHost = (viewMode: string | null) => {
    backend = createInMemoryPreferencesBackend({
      status: PreferencesLoadStatus.LOADED,
      preferences: { ...DEFAULT_PREFERENCES, viewMode },
    });
    render(
      createElement(
        PreferencesProvider,
        {
          repository: createInMemoryPreferencesRepository({
            backend,
          }),
          writeScheduler: createManualWriteScheduler(),
        },
        createElement(
          LocationsProvider,
          { repository: createInMemoryLocationRepository() },
          createElement(ViewHost, { registry: hostRegistry }),
        ),
      ),
    );
  };

  const shownViewId = () =>
    document
      .querySelector(`[${VIEW_ID_ATTRIBUTE}]`)
      ?.getAttribute(VIEW_ID_ATTRIBUTE);

  const expectViewShown = async (viewId: ViewId, text: string) => {
    expect(await screen.findByText(text)).toBeInTheDocument();
    expect(shownViewId()).toBe(viewId);
  };

  const chooseViewInAnotherTab = (viewMode: string) => {
    act(() => {
      createInMemoryPreferencesRepository({ backend }).save({
        ...DEFAULT_PREFERENCES,
        viewMode,
      });
    });
  };

  f.BeforeEachScenario(async () => {
    cleanup();
    resizeObserver = installResizeObserverFake();
    hostRegistry = [];
    backend = createInMemoryPreferencesBackend();
    gridLoader = vi.fn();
    await i18n.changeLanguage("en");
  });

  f.AfterEachScenario(() => {
    vi.unstubAllGlobals();
  });

  f.AfterAllScenarios(() => {
    cleanup();
  });

  // @add-view-mode-setting-and-grid-skeleton @FR3
  f.Scenario("Chosen view is shown", ({ Given, When, Then }) => {
    Given("Cards and Grid are registered", () => {
      hostRegistry = buildRegistry();
    });
    When("the view mode is Grid", () => renderHost(ViewId.GRID));
    Then("the Grid view is shown", () =>
      expectViewShown(ViewId.GRID, GRID_TEXT),
    );
  });

  // @add-view-mode-setting-and-grid-skeleton @FR3
  f.Scenario("No view chosen", ({ Given, When, Then }) => {
    Given("Cards and Grid are registered", () => {
      hostRegistry = buildRegistry();
    });
    When("no view is chosen", () => renderHost(null));
    Then("the Cards view is shown", () =>
      expectViewShown(ViewId.CARDS, CARDS_TEXT),
    );
  });

  // @add-view-mode-setting-and-grid-skeleton @FR3 @FR4
  f.Scenario("Unknown view id", ({ Given, When, Then }) => {
    Given("Cards and Grid are registered", () => {
      hostRegistry = buildRegistry();
    });
    When("the view mode is a view id that is not registered", () =>
      renderHost(UNREGISTERED_VIEW_ID),
    );
    Then("the Cards view is shown", () =>
      expectViewShown(ViewId.CARDS, CARDS_TEXT),
    );
  });

  // @add-view-mode-setting-and-grid-skeleton @FR5
  f.Scenario("Width does not choose the view", ({ Given, When, Then }) => {
    Given("Cards and Grid are registered and the view mode is Grid", () => {
      hostRegistry = buildRegistry();
      renderHost(ViewId.GRID);
    });
    When("the container is 320 px wide and then 2560 px wide", async () => {
      resizeObserver.reportWidth(NARROW_WIDTH);
      await expectViewShown(ViewId.GRID, GRID_TEXT);
      resizeObserver.reportWidth(WIDE_WIDTH);
    });
    Then("the Grid view is shown both times", () =>
      expectViewShown(ViewId.GRID, GRID_TEXT),
    );
  });

  // @add-view-mode-setting-and-grid-skeleton @FR4
  f.Scenario("View mode changes", ({ Given, When, Then }) => {
    Given("the Cards view is shown", async () => {
      hostRegistry = buildRegistry();
      renderHost(null);
      await expectViewShown(ViewId.CARDS, CARDS_TEXT);
    });
    When("the view mode becomes Grid", () =>
      chooseViewInAnotherTab(ViewId.GRID),
    );
    Then("the host shows the Grid view without reloading the page", () =>
      expectViewShown(ViewId.GRID, GRID_TEXT),
    );
  });

  // @add-view-mode-setting-and-grid-skeleton @FR3
  f.Scenario("Registry content", ({ When, Then }) => {
    let registeredViews: readonly ViewDefinition[] = [];
    When("the registry is read", () => {
      registeredViews = viewRegistry;
    });
    Then("it contains exactly two views, Cards and Grid, in this order", () => {
      expect(registeredViews.map((view) => view.id)).toEqual([
        ViewId.CARDS,
        ViewId.GRID,
      ]);
    });
  });

  // @add-view-mode-setting-and-grid-skeleton @FR3
  f.Scenario("Second view needs no page change", ({ When, Then }) => {
    When(
      "a test view is added to the registry and chosen as the view mode",
      () => {
        hostRegistry = [
          ...viewRegistry,
          buildTextView(TEST_VIEW_ID, TEST_VIEW_TEXT),
        ];
        renderHost(TEST_VIEW_ID);
      },
    );
    Then("the host shows it without any change to the main page", async () => {
      expect(await screen.findByText(TEST_VIEW_TEXT)).toBeInTheDocument();
    });
  });

  // @add-view-mode-setting-and-grid-skeleton @NFR-P1
  f.Scenario(
    "Grid is not loaded while Cards is shown",
    ({ Given, When, Then }) => {
      Given("no view is chosen", () => {
        hostRegistry = buildRegistry();
      });
      When("the main page is shown", async () => {
        renderHost(null);
        await expectViewShown(ViewId.CARDS, CARDS_TEXT);
      });
      Then("the Grid component has not been requested", () => {
        expect(gridLoader).not.toHaveBeenCalled();
      });
    },
  );
});
