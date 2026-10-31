// Verifies FR12, FR13, FR14 of add-settings-page-and-device-time-location.
import type { FeatureDescriibeCallbackParams } from "@amiceli/vitest-cucumber";
import { describeFeature, loadFeature } from "@amiceli/vitest-cucumber";
// "pure" skips auto-cleanup: each step is its own test, the app must survive between steps.
import { act, cleanup } from "@testing-library/react/pure";
import { expect, vi } from "vitest";
import { DEVICE_TIME_LOCATION_ID, STORAGE_KEYS } from "@/constants";
import { LocationsStatus } from "@/controller";
import { LocationKind, LocationMarkKind } from "@/model";
import { buildLocation, KNOWN_CITIES } from "@/test/factories/buildLocation";
import {
  addCity,
  DEVICE_TIME_NAME,
  NOT_JSON,
  namesOf,
  type OpenedApp,
  openApp,
  storeDocument,
} from "./locationsPersistenceWorld";

const feature = await loadFeature(
  "../locations_device_time_storage_unit.feature",
);
const VERSION_2 = 2;

describeFeature(feature, (f: FeatureDescriibeCallbackParams) => {
  let app: OpenedApp;
  let deviceZone: string | undefined;

  const idOf = (label: string) =>
    buildLocation({ label, ...KNOWN_CITIES[label] }).id;
  const removeFrom = (current: OpenedApp, id: string) =>
    act(() => current.result.current.removeLocation(id));
  const expectDeviceTimeOnly = () =>
    expect(namesOf(app)).toEqual([DEVICE_TIME_NAME]);
  const expectNoDocument = () =>
    expect(localStorage.getItem(STORAGE_KEYS.LOCATIONS)).toBeNull();

  f.BeforeEachScenario(() => {
    cleanup();
    localStorage.clear();
    deviceZone = undefined;
  });
  f.AfterAllScenarios(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  // @add-settings-page-and-device-time-location @FR12
  f.Scenario("First launch", ({ Given, And, When, Then }) => {
    Given("no locations document is stored", expectNoDocument);
    And("the device time zone is {string}", (_ctx, zone: string) => {
      deviceZone = zone;
    });
    When("the user opens the app", () => {
      app = openApp(undefined, deviceZone);
    });
    Then("the list is the device time location only", expectDeviceTimeOnly);
    And("no location is home", () =>
      expect(
        app.result.current.rows.map(({ mark }) => mark?.kind),
      ).not.toContain(LocationMarkKind.HOME),
    );
    And("no list document is stored", expectNoDocument);
  });

  // @add-settings-page-and-device-time-location @FR13
  f.Scenario("Remove everything and reopen", ({ Given, When, And, Then }) => {
    Given("the list is the device time location, Moscow", () => {
      storeDocument([{ ...KNOWN_CITIES.Moscow, label: "Moscow" }], {
        hasDeviceTime: true,
      });
      app = openApp();
    });
    When(
      "the user removes {string} and the device time location",
      (_ctx, label: string) => {
        removeFrom(app, idOf(label));
        removeFrom(app, DEVICE_TIME_LOCATION_ID);
      },
    );
    And("the app is opened again", () => {
      app.unmount();
      app = openApp();
    });
    Then("the list is empty", () => expect(namesOf(app)).toEqual([]));
  });

  // @add-settings-page-and-device-time-location @FR14
  f.Scenario("Version 2 document is migrated", ({ Given, When, Then, And }) => {
    Given(
      "the stored list is a version 2 document with {string} and {string} and {string} as home",
      (_ctx, first: string, second: string, home: string) => {
        localStorage.setItem(
          STORAGE_KEYS.LOCATIONS,
          JSON.stringify({
            schemaVersion: VERSION_2,
            payload: {
              locations: [first, second].map((label) => ({
                label,
                ...KNOWN_CITIES[label],
              })),
              homeLocationId: idOf(home),
            },
          }),
        );
        vi.spyOn(localStorage, "setItem");
      },
    );
    When("the user opens the app", () => {
      app = openApp();
    });
    Then(
      "the list is the device time location, {string}, {string} in that order",
      (_ctx, first: string, second: string) =>
        expect(namesOf(app)).toEqual([DEVICE_TIME_NAME, first, second]),
    );
    And("{string} is home", (_ctx, label: string) =>
      expect(app.result.current.rowsContext.homeLocationId).toBe(idOf(label)),
    );
    And("the stored list was not written", () =>
      expect(localStorage.setItem).not.toHaveBeenCalled(),
    );
  });

  // @add-settings-page-and-device-time-location @FR12
  f.Scenario(
    "The device time zone is not stored",
    ({ Given, And, When, Then }) => {
      Given("the device time zone is {string}", (_ctx, zone: string) => {
        deviceZone = zone;
      });
      And("the list is the device time location", () => undefined);
      When("the user adds {string} and the list is written", (_ctx, label) => {
        app = openApp(undefined, deviceZone);
        addCity(app, label);
      });
      Then("the stored document holds no {string}", (_ctx, zone: string) => {
        const stored = localStorage.getItem(STORAGE_KEYS.LOCATIONS) ?? "";
        expect(stored).toContain(LocationKind.DEVICE_TIME);
        expect(stored).not.toContain(zone);
      });
    },
  );

  // @add-settings-page-and-device-time-location @FR12
  f.Scenario("Two device time locations", ({ Given, When, Then }) => {
    Given("the stored list holds two device time location entries", () => {
      localStorage.setItem(
        STORAGE_KEYS.LOCATIONS,
        JSON.stringify({
          schemaVersion: 3,
          payload: {
            locations: [
              { kind: LocationKind.DEVICE_TIME },
              { kind: LocationKind.DEVICE_TIME },
            ],
            homeLocationId: null,
          },
        }),
      );
    });
    When("the user opens the app", () => {
      app = openApp();
    });
    Then("the list is reported as unreadable", () =>
      expect(app.result.current.loadStatus).toBe(LocationsStatus.UNREADABLE),
    );
  });

  // @add-settings-page-and-device-time-location @FR12
  f.Scenario("Reset", ({ Given, And, When, Then }) => {
    Given("the stored list is not valid JSON", () =>
      localStorage.setItem(STORAGE_KEYS.LOCATIONS, NOT_JSON),
    );
    And("the user opens the app", () => {
      app = openApp();
    });
    When("the user resets the list", () =>
      act(() => app.result.current.resetLocations()),
    );
    Then("the list is the device time location only", expectDeviceTimeOnly);
    And("no list document is stored", expectNoDocument);
  });
});
