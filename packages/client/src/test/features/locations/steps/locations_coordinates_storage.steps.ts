// Implements FR7, FR9 of add-city-coordinates-to-locations: coordinates kept on the device.
import type { FeatureDescriibeCallbackParams } from "@amiceli/vitest-cucumber";
import { describeFeature, loadFeature } from "@amiceli/vitest-cucumber";
// "pure" skips auto-cleanup: each step is its own test, the app must survive between steps.
import { act, cleanup } from "@testing-library/react/pure";
import { expect, vi } from "vitest";
import { STORAGE_KEYS } from "@/constants";
import { LocationsStatus } from "@/controller";
import { LocationKind, LocationMarkKind } from "@/model";
import { createInMemoryChannelHub } from "@/test/inMemoryChannel";
import {
  cityEntry,
  DEVICE_TIME_NAME,
  namesOf,
  type OpenedApp,
  openApp,
} from "./locationsPersistenceWorld";

const feature = await loadFeature("../locations_coordinates_storage.feature");

const VERSION_3 = 3;
const NEWER_VERSION = 5;
const CURRENT_VERSION = 4;
const KAZAN_COORDINATES = { latitude: 55.8, longitude: 49.1 };
const MOSCOW_ID = "Europe/Moscow|Moscow";
const MALFORMED_COORDINATES: Record<string, unknown> = {
  "a latitude and no longitude": { latitude: 55.8 },
  'the latitude "55.8" as text': { latitude: "55.8", longitude: 37.6 },
  "the latitude 91": { latitude: 91, longitude: 37.6 },
  "the longitude -181": { latitude: 55.8, longitude: -181 },
};

const storeRaw = (schemaVersion: number, payload: unknown) =>
  localStorage.setItem(
    STORAGE_KEYS.LOCATIONS,
    JSON.stringify({ schemaVersion, payload }),
  );
const storedPayload = () =>
  JSON.parse(localStorage.getItem(STORAGE_KEYS.LOCATIONS) ?? "{}").payload;
const coordinatesOf = (app: OpenedApp, label: string) =>
  app.result.current.locations.find((location) => location.label === label)
    ?.coordinates;
const addKazan = (app: OpenedApp) =>
  act(() => {
    app.result.current.addLocation({
      ...cityEntry("Kazan"),
      coordinates: KAZAN_COORDINATES,
    });
  });

describeFeature(feature, (f: FeatureDescriibeCallbackParams) => {
  let app: OpenedApp;
  let secondApp: OpenedApp;
  let rawBefore: string | null = null;

  f.BeforeEachScenario(() => {
    cleanup();
    localStorage.clear();
    vi.restoreAllMocks();
  });
  f.AfterAllScenarios(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  const expectUnreadable = () =>
    expect(app.result.current.loadStatus).toBe(LocationsStatus.UNREADABLE);
  const openStoredApp = () => {
    rawBefore = localStorage.getItem(STORAGE_KEYS.LOCATIONS);
    app = openApp();
  };

  // @add-city-coordinates-to-locations @FR7
  f.Scenario("Coordinates survive a reload", ({ Given, When, Then }) => {
    Given("the user added Kazan with the coordinates 55.8, 49.1", () => {
      app = openApp();
      addKazan(app);
      cleanup();
    });
    When("the app is opened again without a network connection", () => {
      app = openApp();
    });
    Then("the location Kazan holds the coordinates 55.8, 49.1", () =>
      expect(coordinatesOf(app, "Kazan")).toEqual(KAZAN_COORDINATES),
    );
  });

  // @add-city-coordinates-to-locations @FR7
  f.Scenario(
    "A list stored before coordinates",
    ({ Given, When, Then, And }) => {
      Given(
        "a version 3 stored list holds the device time location, Moscow and Almaty, and Moscow is home",
        () => {
          storeRaw(VERSION_3, {
            locations: [
              { kind: LocationKind.DEVICE_TIME },
              { kind: LocationKind.CITY, ...cityEntry("Moscow") },
              { kind: LocationKind.CITY, ...cityEntry("Almaty") },
            ],
            homeLocationId: MOSCOW_ID,
          });
          vi.spyOn(localStorage, "setItem");
        },
      );
      When("the app is opened", openStoredApp);
      Then(
        "the list is the device time location, Moscow, Almaty without coordinates",
        () => {
          expect(namesOf(app)).toEqual([DEVICE_TIME_NAME, "Moscow", "Almaty"]);
          expect(
            app.result.current.locations.map(
              (location) => location.coordinates,
            ),
          ).toEqual([undefined, undefined, undefined]);
        },
      );
      And("Moscow is home", () => {
        expect(
          app.result.current.rows.find(
            ({ mark }) => mark?.kind === LocationMarkKind.HOME,
          )?.cityLabel,
        ).toBe("Moscow");
      });
      And("the stored list was not written on load", () => {
        expect(localStorage.setItem).not.toHaveBeenCalled();
      });
    },
  );

  // @add-city-coordinates-to-locations @FR7
  f.Scenario("A document newer than the app", ({ Given, When, Then }) => {
    Given("the stored list has the document version 5", () => {
      storeRaw(NEWER_VERSION, { locations: [], homeLocationId: null });
    });
    When("the app is opened", openStoredApp);
    Then("the stored list is unreadable", expectUnreadable);
  });

  // @add-city-coordinates-to-locations @FR7
  f.ScenarioOutline(
    "Malformed coordinates make the list unreadable",
    ({ Given, When, Then, And }, variables) => {
      Given("the stored entry of Moscow has <coordinates>", () => {
        storeRaw(CURRENT_VERSION, {
          locations: [
            {
              kind: LocationKind.CITY,
              ...cityEntry("Moscow"),
              coordinates: MALFORMED_COORDINATES[variables.coordinates],
            },
          ],
          homeLocationId: null,
        });
      });
      When("the app is opened", openStoredApp);
      Then("the stored list is unreadable", expectUnreadable);
      And("the stored value is not overwritten", () => {
        expect(localStorage.getItem(STORAGE_KEYS.LOCATIONS)).toBe(rawBefore);
      });
    },
  );

  // @add-city-coordinates-to-locations @FR7 @FR9
  f.Scenario(
    "The device time location is stored without coordinates",
    ({ Given, When, Then }) => {
      Given("the list is the device time location and Kazan", () => {
        app = openApp();
        addKazan(app);
      });
      When("the list is written", () => {
        // The immediate write scheduler of openApp writes on the add itself.
        expect(localStorage.getItem(STORAGE_KEYS.LOCATIONS)).not.toBeNull();
      });
      Then(
        "the stored entry of the device time location holds no coordinates",
        () => {
          const [deviceEntry] = storedPayload().locations;
          expect(deviceEntry).toEqual({ kind: LocationKind.DEVICE_TIME });
        },
      );
    },
  );

  // @add-city-coordinates-to-locations @FR7
  f.Scenario(
    "A stored device time location with coordinates",
    ({ Given, When, Then }) => {
      Given(
        "the stored entry of the device time location holds coordinates",
        () => {
          storeRaw(CURRENT_VERSION, {
            locations: [
              {
                kind: LocationKind.DEVICE_TIME,
                coordinates: KAZAN_COORDINATES,
              },
            ],
            homeLocationId: null,
          });
        },
      );
      When("the app is opened", openStoredApp);
      Then("the stored list is unreadable", expectUnreadable);
    },
  );

  // @add-city-coordinates-to-locations @FR7
  f.Scenario(
    "Another tab receives the coordinates",
    ({ Given, When, Then }) => {
      Given("the app is open in two tabs", () => {
        const hub = createInMemoryChannelHub();
        app = openApp(hub.createChannel);
        secondApp = openApp(hub.createChannel);
      });
      When(
        "the user adds Kazan with the coordinates 55.8, 49.1 in the first tab",
        () => addKazan(app),
      );
      Then(
        "the location Kazan of the second tab holds the coordinates 55.8, 49.1",
        () =>
          expect(coordinatesOf(secondApp, "Kazan")).toEqual(KAZAN_COORDINATES),
      );
    },
  );
});
