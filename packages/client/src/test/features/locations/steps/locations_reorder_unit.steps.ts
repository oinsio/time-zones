import type { FeatureDescriibeCallbackParams } from "@amiceli/vitest-cucumber";
import { describeFeature, loadFeature } from "@amiceli/vitest-cucumber";
// "pure" skips auto-cleanup: each step is its own test, the app must survive between steps.
import { act, cleanup, render } from "@testing-library/react/pure";
import i18n from "i18next";
import { createElement } from "react";
import { expect } from "vitest";
import { STORAGE_KEYS } from "@/constants";
import ru from "@/locales/ru.json";
import {
  INITIAL_WORLD_CLOCK_STATE,
  LocationCommandType,
  LocationErrorCode,
  type LocationsReduceResult,
  reduceLocations,
} from "@/model";
import type { LocationRow } from "@/presenter";
import { createInMemoryChannelHub } from "@/test/inMemoryChannel";
import { startWorkCount, type WorkCount } from "@/test/workCounters";
import { LocationList } from "@/views/shared";
import {
  cityEntry,
  labelsOf,
  type OpenedApp,
  openApp,
  storeDocument,
} from "./locationsPersistenceWorld";
import {
  idOf,
  splitLabels,
  spyOnStorageWrites,
} from "./locationsReorderUnitWorld";
import {
  BUDGET_ROW_COUNT,
  buildBudgetLocations,
  presentBudgetRows,
} from "./rowBudgetWorld";

const feature = await loadFeature("../locations_reorder_unit.feature");

describeFeature(feature, (f: FeatureDescriibeCallbackParams) => {
  let app: OpenedApp;
  let secondApp: OpenedApp;
  let moveOutcome: LocationsReduceResult | undefined;
  let locationWrites: ReturnType<typeof vi.spyOn> | undefined;
  let workCount: WorkCount;

  const seedAndOpen = (labels: string, createChannel?: () => never) => {
    storeDocument(splitLabels(labels).map(cityEntry));
    app = openApp(createChannel);
  };
  const openTwoTabs = (labels: string) => {
    storeDocument(splitLabels(labels).map(cityEntry));
    const hub = createInMemoryChannelHub();
    app = openApp(hub.createChannel);
    secondApp = openApp(hub.createChannel);
  };
  const moveIn = (tab: OpenedApp, label: string, position: number) => {
    act(() => {
      moveOutcome = tab.result.current.moveLocation(idOf(label), position - 1);
    });
  };
  const expectList = (labels: string) =>
    expect(labelsOf(app)).toEqual(splitLabels(labels));
  const locationWriteCount = () =>
    locationWrites?.mock.calls.filter(([key]) => key === STORAGE_KEYS.LOCATIONS)
      .length;

  f.AfterEachScenario(() => workCount?.stop());

  f.BeforeEachScenario(() => {
    cleanup();
    localStorage.clear();
    vi.restoreAllMocks();
    moveOutcome = undefined;
    locationWrites = undefined;
  });
  f.AfterAllScenarios(() => cleanup());

  // @reorder-locations-by-drag-and-drop @FR2 @M2
  f.ScenarioOutline(
    "Move to every kind of position",
    ({ Given, When, Then }, variables) => {
      Given("the list is {string}", (_ctx, labels: string) =>
        seedAndOpen(labels),
      );
      When('the user moves "<city>" to position <position>', () => {
        moveIn(app, variables.city, Number(variables.position));
      });
      Then('the list is "<order>"', () => expectList(variables.order));
    },
  );

  // @reorder-locations-by-drag-and-drop @FR2 @FR3 @M5
  f.Scenario("Move to its own position", ({ Given, And, When, Then }) => {
    Given("the list is {string}", (_ctx, labels: string) =>
      seedAndOpen(labels),
    );
    And("location writes are counted", () => {
      locationWrites = spyOnStorageWrites(false);
    });
    When(
      "the user moves {string} to position {int}",
      (_ctx, label: string, position: number) => moveIn(app, label, position),
    );
    Then("the list is {string}", (_ctx, labels: string) => expectList(labels));
    And("no location write happened", () =>
      expect(locationWriteCount()).toBe(0),
    );
  });

  // @reorder-locations-by-drag-and-drop @FR2 @M2
  f.ScenarioOutline(
    "Position outside the list",
    ({ Given, When, Then, And }, variables) => {
      Given("the list is {string}", (_ctx, labels: string) =>
        seedAndOpen(labels),
      );
      When(
        "the user moves {string} to position <position>",
        (_ctx, label: string) => moveIn(app, label, Number(variables.position)),
      );
      Then("the move is rejected as position out of range", () => {
        expect(moveOutcome).toEqual({
          ok: false,
          error: LocationErrorCode.LOCATION_POSITION_OUT_OF_RANGE,
        });
      });
      And("the list is {string}", (_ctx, labels: string) => expectList(labels));
    },
  );

  // @reorder-locations-by-drag-and-drop @FR2 @M2
  f.Scenario("Location already gone", ({ Given, And, When, Then }) => {
    Given("the app is open in two tabs with {string}", (_ctx, labels: string) =>
      openTwoTabs(labels),
    );
    And("{string} was removed in the second tab", (_ctx, label: string) => {
      act(() => {
        secondApp.result.current.removeLocation(idOf(label));
      });
    });
    When(
      "the user moves {string} to position {int} in the first tab",
      (_ctx, label: string, position: number) => moveIn(app, label, position),
    );
    Then("the move is rejected as location not found", () => {
      expect(moveOutcome).toEqual({
        ok: false,
        error: LocationErrorCode.LOCATION_NOT_FOUND,
      });
    });
    And("the list is {string}", (_ctx, labels: string) => expectList(labels));
  });

  // @reorder-locations-by-drag-and-drop @FR4
  f.Scenario("Order survives a reload", ({ Given, And, When, Then }) => {
    Given("the list is {string}", (_ctx, labels: string) =>
      seedAndOpen(labels),
    );
    And(
      "the user moved {string} to position {int}",
      (_ctx, label: string, position: number) => {
        moveIn(app, label, position);
        app.unmount();
      },
    );
    When("the app is opened again", () => {
      app = openApp();
    });
    Then("the list is {string}", (_ctx, labels: string) => expectList(labels));
  });

  // @reorder-locations-by-drag-and-drop @FR5
  f.Scenario("Moved in another tab", ({ Given, When, Then }) => {
    Given("the app is open in two tabs with {string}", (_ctx, labels: string) =>
      openTwoTabs(labels),
    );
    When(
      "the user moves {string} to position {int} in the first tab",
      (_ctx, label: string, position: number) => moveIn(app, label, position),
    );
    Then("the second tab lists {string}", (_ctx, labels: string) => {
      expect(labelsOf(secondApp)).toEqual(splitLabels(labels));
    });
  });

  // @reorder-locations-by-drag-and-drop @FR6
  f.Scenario("Storage cannot be written", ({ Given, And, When, Then }) => {
    Given("the list is {string}", (_ctx, labels: string) =>
      seedAndOpen(labels),
    );
    And("writing to storage fails", () => {
      spyOnStorageWrites(true);
    });
    When(
      "the user moves {string} to position {int}",
      (_ctx, label: string, position: number) => moveIn(app, label, position),
    );
    Then("the list is {string}", (_ctx, labels: string) => expectList(labels));
    And("the storage warning is flagged", () => {
      expect(app.result.current.hasSaveFailed).toBe(true);
    });
  });

  // @reorder-locations-by-drag-and-drop @FR8
  f.Scenario("Russian interface", ({ Given, When, Then }) => {
    Given("the interface language is Russian", async () => {
      await i18n.changeLanguage("ru");
    });
    When("the list {string} is shown", (_ctx, labels: string) => {
      const rows = splitLabels(labels).map((label) => ({
        id: idOf(label),
        cityLabel: label,
        countryName: "",
        utcOffsetLabel: "",
        offsetDifferenceLabel: "",
        offsetDifferenceAccessibleLabel: "",
        localTimeLabel: "",
        localDateLabel: "",
        localIsoDate: "",
        wallTimeInputLabel: "",
      }));
      render(
        createElement(LocationList, {
          rows,
          onRemove: vi.fn(),
          onSetHome: vi.fn(),
          onMove: vi.fn(),
          onSelectTrackFraction: vi.fn(),
          onMoveTrack: vi.fn(),
        }),
      );
    });
    Then(
      "the list offers the Russian move action for {string}",
      (_ctx, label: string) => {
        const name = ru.locations.moveLocation.replace("{{city}}", label);
        expect(
          document.querySelector(`button[aria-label="${name}"]`),
        ).not.toBeNull();
      },
    );
  });

  // @reorder-locations-by-drag-and-drop @NFR-P1
  // @replace-wall-clock-row-budgets-with-deterministic-checks @FR1
  f.Scenario("50 locations within the budget", ({ Given, When, Then, And }) => {
    let locations: ReturnType<typeof buildBudgetLocations> = [];
    let presentedRows: LocationRow[] = [];
    Given("a list of 50 locations whose rows have been presented once", () => {
      locations = buildBudgetLocations(BUDGET_ROW_COUNT);
      presentBudgetRows(locations);
    });
    When(
      "the last location is moved to position 1 and the rows are presented",
      () => {
        const lastLocation = locations[locations.length - 1];
        workCount = startWorkCount();
        const outcome = reduceLocations(
          { ...INITIAL_WORLD_CLOCK_STATE, locations },
          {
            type: LocationCommandType.MOVE_LOCATION,
            id: lastLocation?.id ?? "",
            targetIndex: 0,
          },
        );
        if (outcome.ok) {
          presentedRows = presentBudgetRows(outcome.state.locations);
        }
        workCount.stop();
      },
    );
    Then("no date, time or region name formatter is built", () => {
      expect(workCount.formatters()).toBe(0);
      expect(workCount.displayNames()).toBe(0);
    });
    And("no time zone transition is looked up", () => {
      expect(workCount.transitionLookups()).toBe(0);
    });
    And("the first row is the location that was last", () => {
      expect(presentedRows[0]?.cityLabel).toBe(locations.at(-1)?.label);
    });
  });
});
