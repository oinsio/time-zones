import type { FeatureDescriibeCallbackParams } from "@amiceli/vitest-cucumber";
import { describeFeature, loadFeature } from "@amiceli/vitest-cucumber";
// "pure" skips auto-cleanup: each step is its own test, the app must survive between steps.
import { act, cleanup, render } from "@testing-library/react/pure";
import i18n from "i18next";
import { createElement } from "react";
import { expect } from "vitest";
import { STORAGE_KEYS } from "@/constants";
import { fakeClock } from "@/lib/temporal";
import ru from "@/locales/ru.json";
import {
  LocationCommandType,
  LocationErrorCode,
  type LocationsReduceResult,
  reduceLocations,
} from "@/model";
import { presentLocationRows } from "@/presenter";
import { buildLocation } from "@/test/factories/buildLocation";
import { createInMemoryChannelHub } from "@/test/inMemoryChannel";
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

const feature = await loadFeature("../locations_reorder_unit.feature");

const BUDGET_LOCATION_COUNT = 50;
const BUDGET_MS = 50;
const BUDGET_INSTANT = "2026-07-15T12:00:00Z";

describeFeature(feature, (f: FeatureDescriibeCallbackParams) => {
  let app: OpenedApp;
  let secondApp: OpenedApp;
  let moveOutcome: LocationsReduceResult | undefined;
  let locationWrites: ReturnType<typeof vi.spyOn> | undefined;
  let elapsedMs = 0;

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
      }));
      render(
        createElement(LocationList, {
          rows,
          onRemove: vi.fn(),
          onMove: vi.fn(),
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
  f.Scenario("50 locations within the budget", ({ Given, When, Then }) => {
    let locations: ReturnType<typeof buildLocation>[] = [];
    Given("a list of 50 locations", () => {
      locations = Array.from({ length: BUDGET_LOCATION_COUNT }, (_, index) =>
        buildLocation({ label: `City ${index}` }),
      );
    });
    When(
      "the last location is moved to position 1 and the rows are presented",
      async () => {
        await i18n.changeLanguage("en");
        const lastLocation = locations[locations.length - 1];
        const startedAt = performance.now();
        const outcome = reduceLocations(
          { locations },
          {
            type: LocationCommandType.MOVE_LOCATION,
            id: lastLocation?.id ?? "",
            targetIndex: 0,
          },
        );
        if (outcome.ok) {
          presentLocationRows(outcome.state.locations, {
            language: "en",
            instant: fakeClock(BUDGET_INSTANT).instant(),
            translate: i18n.t,
          });
        }
        elapsedMs = performance.now() - startedAt;
      },
    );
    Then("it takes at most 50 ms", () => {
      expect(elapsedMs).toBeLessThanOrEqual(BUDGET_MS);
    });
  });
});
