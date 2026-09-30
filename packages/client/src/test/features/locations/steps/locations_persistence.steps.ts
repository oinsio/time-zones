import type { FeatureDescriibeCallbackParams } from "@amiceli/vitest-cucumber";
import { describeFeature, loadFeature } from "@amiceli/vitest-cucumber";
import { expect } from "vitest";
// "pure" skips auto-cleanup: each step is its own test, the app must survive between steps.
import { act, cleanup, renderHook } from "@testing-library/react/pure";
import { createElement, type ReactNode } from "react";
import {
  createLocalStorageLocationRepository,
  type LocationsSyncChannel,
} from "@/adapters";
import { STORAGE_KEYS } from "@/constants";
import {
  LocationsProvider,
  LocationsStatus,
  useLocations,
} from "@/controller";
import { buildLocation, KNOWN_CITIES } from "@/test/factories/buildLocation";
import { createInMemoryChannelHub } from "@/test/inMemoryChannel";
import { immediateWriteScheduler } from "@/test/writeSchedulers";

const feature = await loadFeature("../locations_persistence.feature");

const DOCUMENT_VERSION = 1;
const NEWER_DOCUMENT_VERSION = 99;
const NOT_JSON = "{not json";
const UNREADABLE_DOCUMENTS: Record<string, string> = {
  "not valid JSON": NOT_JSON,
  "written by a newer version": JSON.stringify({
    schemaVersion: NEWER_DOCUMENT_VERSION,
    payload: { locations: [] },
  }),
  'holding a location in "+05:00"': JSON.stringify({
    schemaVersion: DOCUMENT_VERSION,
    payload: {
      locations: [{ timeZoneId: "+05:00", label: "Nowhere", countryCode: "" }],
    },
  }),
};

const storeDocument = (
  entries: { timeZoneId: string; label: string; countryCode: string }[],
) =>
  localStorage.setItem(
    STORAGE_KEYS.LOCATIONS,
    JSON.stringify({
      schemaVersion: DOCUMENT_VERSION,
      payload: { locations: entries },
    }),
  );
const cityEntry = (label: string) => ({
  label,
  timeZoneId: KNOWN_CITIES[label]?.timeZoneId ?? "",
  countryCode: KNOWN_CITIES[label]?.countryCode ?? "",
});

type OpenedApp = ReturnType<typeof openApp>;

function openApp(createChannel?: () => LocationsSyncChannel | undefined) {
  const repository = createLocalStorageLocationRepository({
    getStorage: () => localStorage,
    createChannel,
  });
  return renderHook(() => useLocations(), {
    wrapper: ({ children }: { children: ReactNode }) =>
      createElement(
        LocationsProvider,
        { repository, writeScheduler: immediateWriteScheduler },
        children,
      ),
  });
}

const labelsOf = (app: OpenedApp) =>
  app.result.current.locations.map(({ label }) => label);
const addCity = (app: OpenedApp, label: string) =>
  act(() => {
    app.result.current.addLocation(cityEntry(label));
  });

describeFeature(feature, (f: FeatureDescriibeCallbackParams) => {
  f.AfterAllScenarios(() => {
    cleanup();
  });

  let app: OpenedApp;
  let secondApp: OpenedApp;

  f.BeforeEachScenario(() => {
    cleanup();
    localStorage.clear();
  });

  f.Scenario("List survives a reload", ({ Given, When, Then }) => {
    Given("the user added {string}, then {string}", (_ctx, first: string, second: string) => {
      const firstSession = openApp();
      addCity(firstSession, first);
      addCity(firstSession, second);
      firstSession.unmount();
    });
    When("the app is opened again", () => {
      app = openApp();
    });
    Then("the list is {string}, {string} in that order", (_ctx, first: string, second: string) => {
      expect(labelsOf(app)).toEqual([first, second]);
    });
  });

  f.Scenario("First launch writes nothing", ({ When, Then }) => {
    When("the user opens the app for the first time and adds nothing", () => {
      app = openApp();
    });
    Then("no list document is stored", () => {
      expect(localStorage.getItem(STORAGE_KEYS.LOCATIONS)).toBeNull();
    });
  });

  f.Scenario(
    "Legacy identifier is canonicalized on load",
    ({ Given, When, Then }) => {
      Given("the stored list holds {string} in {string}", (_ctx, label: string, zone: string) => {
        storeDocument([{ ...cityEntry(label), timeZoneId: zone }]);
      });
      When("the app is opened", () => {
        app = openApp();
      });
      Then("the list holds {string} in {string}", (_ctx, label: string, zone: string) => {
        expect(app.result.current.locations).toEqual([
          buildLocation({ ...cityEntry(label), timeZoneId: zone }),
        ]);
      });
    },
  );

  f.ScenarioOutline("Unreadable stored list", ({ Given, When, Then }, variables) => {
    Given("the stored list is <document>", () => {
      localStorage.setItem(
        STORAGE_KEYS.LOCATIONS,
        UNREADABLE_DOCUMENTS[variables.document] ?? "",
      );
    });
    When("the app is opened", () => {
      app = openApp();
    });
    Then("the list is reported as unreadable", () => {
      expect(app.result.current.loadStatus).toBe(LocationsStatus.UNREADABLE);
    });
  });

  f.Scenario("Reset", ({ Given, And, When, Then }) => {
    Given("the stored list is not valid JSON", () => {
      localStorage.setItem(STORAGE_KEYS.LOCATIONS, NOT_JSON);
    });
    And("the app is opened", () => {
      app = openApp();
    });
    When("the user resets the list", () => {
      act(() => app.result.current.resetLocations());
    });
    Then("the list is empty", () => {
      expect(app.result.current.locations).toEqual([]);
      expect(app.result.current.loadStatus).toBe(LocationsStatus.READY);
    });
    And("no list document is stored", () => {
      expect(localStorage.getItem(STORAGE_KEYS.LOCATIONS)).toBeNull();
    });
  });

  f.Scenario("Added in another tab", ({ Given, When, Then }) => {
    Given("the app is open in two tabs with the same list", () => {
      const hub = createInMemoryChannelHub();
      app = openApp(hub.createChannel);
      secondApp = openApp(hub.createChannel);
    });
    When("the user adds {string} in the first tab", (_ctx, label: string) => {
      addCity(app, label);
    });
    Then("the second tab shows {string} without a reload", (_ctx, label: string) => {
      expect(labelsOf(secondApp)).toEqual([label]);
    });
  });

  f.Scenario("Removed in another tab", ({ Given, When, Then }) => {
    Given("the app is open in two tabs and both show {string}", (_ctx, label: string) => {
      storeDocument([cityEntry(label)]);
      const hub = createInMemoryChannelHub();
      app = openApp(hub.createChannel);
      secondApp = openApp(hub.createChannel);
      expect(labelsOf(app)).toEqual([label]);
      expect(labelsOf(secondApp)).toEqual([label]);
    });
    When("the user removes {string} in the second tab", (_ctx, label: string) => {
      act(() => {
        secondApp.result.current.removeLocation(
          buildLocation({ label, ...KNOWN_CITIES[label] }).id,
        );
      });
    });
    Then("the first tab no longer shows {string}", (_ctx, label: string) => {
      expect(labelsOf(app)).not.toContain(label);
    });
  });
});
