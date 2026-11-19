import type { FeatureDescriibeCallbackParams } from "@amiceli/vitest-cucumber";
import { describeFeature, loadFeature } from "@amiceli/vitest-cucumber";
// "pure" skips auto-cleanup: each step is its own test, the app must survive between steps.
import { act, cleanup, render, screen } from "@testing-library/react/pure";
import userEvent from "@testing-library/user-event";
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
import { ignoreWallTime } from "@/test/ignoreWallTime";
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

  f.BeforeEachScenario(async () => {
    cleanup();
    await i18n.changeLanguage("en");
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

  /** A minimal day track: a row has one when its zone is known, which is what offers "Make home". */
  const KNOWN_ZONE_TRACK = {
    fraction: 0.5,
    valueMinutes: 720,
    maxMinutes: 1439,
    valueText: "12:00",
    stops: [],
    hourLabels: [],
  };
  const menuRows = (labels: string) =>
    splitLabels(labels).map((label) => ({
      id: idOf(label),
      cityLabel: label,
      countryName: "",
      utcOffsetLabel: "",
      zoneAbbreviationLabel: "",
      zoneLineParts: [],
      offsetDifferenceLabel: "",
      offsetDifferenceAccessibleLabel: "",
      localTimeLabel: "",
      localTimeParts: { digits: "", dayPeriodMarker: "" },
      localDateLabel: "",
      localIsoDate: "",
      wallTimeInputLabel: "",
      dayTrack: KNOWN_ZONE_TRACK,
    }));
  const onMoveSpy = vi.fn();
  const showList = (_ctx: unknown, labels: string) => {
    onMoveSpy.mockClear();
    render(
      createElement(LocationList, {
        rows: menuRows(labels),
        onRemove: vi.fn(),
        onSetHome: vi.fn(),
        onMove: onMoveSpy,
        onSelectTrackFraction: vi.fn(),
        onMoveTrack: vi.fn(),
        onConfirmWallTime: ignoreWallTime,
      }),
    );
  };
  const menuButtonOf = (label: string) =>
    screen.getByRole("button", {
      name: i18n.t("locations.locationMenu", { city: label }),
    });
  const openMenuOf = async (label: string) => {
    await userEvent.click(menuButtonOf(label));
  };
  const itemOf = (name: string) => screen.getByRole("menuitem", { name });
  const expectDisabledState = async (
    label: string,
    disabledName: string,
    enabledName: string,
  ) => {
    await openMenuOf(label);
    expect(itemOf(disabledName)).toHaveAttribute("aria-disabled", "true");
    expect(itemOf(enabledName)).not.toHaveAttribute("aria-disabled");
    await userEvent.keyboard("{Escape}");
  };

  // @reorder-locations-by-drag-and-drop @FR8
  // @redesign-cards-grid-and-day-palettes @FR16
  f.Scenario("Russian interface", ({ Given, When, Then }) => {
    Given("the interface language is Russian", async () => {
      await i18n.changeLanguage("ru");
    });
    When("the list {string} is shown", showList);
    Then(
      "the menu of {string} offers the Russian move actions {string} and {string}",
      async (_ctx, label: string, moveUp: string, moveDown: string) => {
        await openMenuOf(label);
        expect(ru.locations.moveUp).toBe(moveUp);
        expect(ru.locations.moveDown).toBe(moveDown);
        expect(itemOf(moveUp)).toBeInTheDocument();
        expect(itemOf(moveDown)).toBeInTheDocument();
      },
    );
  });

  // @redesign-cards-grid-and-day-palettes @FR16
  f.Scenario("Move up from the menu", ({ Given, When, Then, And }) => {
    Given("the list {string} is shown", showList);
    When(
      "the user chooses {string} in the menu of {string}",
      async (_ctx, itemName: string, label: string) => {
        await openMenuOf(label);
        await userEvent.click(itemOf(itemName));
      },
    );
    Then(
      "the list was asked to move {string} to position {int}",
      (_ctx, label: string, position: number) =>
        expect(onMoveSpy).toHaveBeenCalledWith(idOf(label), position - 1),
    );
    And(
      "the focus stays on the menu button of {string}",
      (_ctx, label: string) => {
        expect(menuButtonOf(label)).toBeInTheDocument();
      },
    );
  });

  // @redesign-cards-grid-and-day-palettes @FR16
  f.Scenario("Move down with the keyboard only", ({ Given, When, Then }) => {
    Given("the list {string} is shown", showList);
    When(
      "the user opens the menu of {string} with the keyboard and chooses {string} with the arrow keys and Enter",
      async (_ctx, label: string) => {
        menuButtonOf(label).focus();
        await userEvent.keyboard("{Enter}{ArrowDown}{Enter}");
      },
    );
    Then(
      "the list was asked to move {string} to position {int}",
      (_ctx, label: string, position: number) =>
        expect(onMoveSpy).toHaveBeenCalledWith(idOf(label), position - 1),
    );
  });

  // @redesign-cards-grid-and-day-palettes @FR16
  f.Scenario("Items that cannot apply are disabled", ({ Given, Then, And }) => {
    Given("the list {string} is shown", showList);
    Then(
      "in the menu of {string} {string} is disabled and {string} is enabled",
      (_ctx, label: string, disabledName: string, enabledName: string) =>
        expectDisabledState(label, disabledName, enabledName),
    );
    And(
      "in the menu of {string} {string} is disabled and {string} is enabled",
      (_ctx, label: string, disabledName: string, enabledName: string) =>
        expectDisabledState(label, disabledName, enabledName),
    );
  });

  // @redesign-cards-grid-and-day-palettes @FR16
  f.Scenario("Menu order", ({ Given, Then }) => {
    Given("the list {string} is shown", showList);
    Then(
      "the menu of {string} offers {string} in that order",
      async (_ctx, label: string, names: string) => {
        await openMenuOf(label);
        expect(
          screen.getAllByRole("menuitem").map((item) => item.textContent),
        ).toEqual(names.split(", "));
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
