// Implements FR6, FR9, UX1 of add-city-coordinates-to-locations: coordinates of a city location.
import type { FeatureDescriibeCallbackParams } from "@amiceli/vitest-cucumber";
import { describeFeature, loadFeature } from "@amiceli/vitest-cucumber";
// "pure" skips auto-cleanup: each step is its own test, the app must survive between steps.
import { act, waitFor } from "@testing-library/react/pure";
import i18n from "i18next";
import { expect, vi } from "vitest";
import { STORAGE_KEYS } from "@/constants";
import type { LocationsReduceResult } from "@/model";
import { type Coordinates, LocationErrorCode, LocationKind } from "@/model";
import { buildLocation } from "@/test/factories/buildLocation";
import {
  type OpenedApp,
  openApp as openLocationsApp,
  storeDocument,
} from "./locationsPersistenceWorld";
import {
  closeApp,
  openApp as openRealApp,
  searchAndChoose,
} from "./locationsUiWorld";
import { BUDGET_FIRST_MOMENT, presentBudgetRows } from "./rowBudgetWorld";

vi.mock(
  "virtual:pwa-register/react",
  async () =>
    (await import("@/test/fakeServiceWorker")).fakeServiceWorkerModule,
);

const feature = await loadFeature("../locations_coordinates.feature");

type StoredEntry = { label: string; coordinates?: Coordinates; kind: string };
const storedEntries = (): StoredEntry[] =>
  JSON.parse(localStorage.getItem(STORAGE_KEYS.LOCATIONS) ?? "{}").payload
    ?.locations ?? [];
const storedEntryOf = (label: string) =>
  storedEntries().find((entry) => entry.label === label);
const SPRINGFIELD = {
  label: "Springfield",
  timeZoneId: "America/Chicago",
  countryCode: "US",
};

describeFeature(feature, (f: FeatureDescriibeCallbackParams) => {
  let app: OpenedApp;
  let outcome: LocationsReduceResult;

  f.BeforeEachScenario(async () => {
    closeApp();
    await i18n.changeLanguage("en");
  });
  f.AfterAllScenarios(() => {
    closeApp();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  const expectStoredCoordinates = async (
    _ctx: unknown,
    label: string,
    latitude: number,
    longitude: number,
  ) => {
    await waitFor(() =>
      expect(storedEntryOf(label)?.coordinates).toEqual({
        latitude,
        longitude,
      }),
    );
  };

  // @add-city-coordinates-to-locations @FR6
  f.Scenario("A city added from the search", ({ When, Then }) => {
    When(
      "the user adds {string} from the search",
      async (_ctx, city: string) => {
        await openRealApp();
        await searchAndChoose(city, city);
      },
    );
    Then(
      "the location {string} holds the coordinates {number}, {number}",
      expectStoredCoordinates,
    );
  });

  // @add-city-coordinates-to-locations @FR6
  f.Scenario("A city added by its zone abbreviation", ({ When, Then }) => {
    When(
      "the user searches for {string} and adds {string}",
      async (_ctx, query: string, city: string) => {
        await openRealApp();
        await searchAndChoose(query, city);
      },
    );
    Then(
      "the location {string} holds the coordinates {number}, {number}",
      expectStoredCoordinates,
    );
  });

  // @add-city-coordinates-to-locations @FR6
  f.Scenario("UTC", ({ When, Then }) => {
    When(
      "the user adds {string} from the search",
      async (_ctx, city: string) => {
        await openRealApp();
        await searchAndChoose(city, city);
      },
    );
    Then(
      "the location {string} holds no coordinates",
      async (_ctx, label: string) => {
        await waitFor(() => expect(storedEntryOf(label)).toBeDefined());
        expect(storedEntryOf(label)).not.toHaveProperty("coordinates");
      },
    );
  });

  // @add-city-coordinates-to-locations @FR6
  f.Scenario("The device time location", ({ Given, When, Then }) => {
    let deviceZone = "";
    Given("the device time zone is {string}", (_ctx, zone: string) => {
      deviceZone = zone;
    });
    When("the user adds the device time location", () => {
      storeDocument([], { hasDeviceTime: false });
      app = openLocationsApp(undefined, deviceZone);
      act(() => {
        app.result.current.addDeviceTimeLocation();
      });
    });
    Then("the device time location holds no coordinates", () => {
      const [deviceTime] = app.result.current.locations;
      expect(deviceTime?.kind).toBe(LocationKind.DEVICE_TIME);
      expect(deviceTime).not.toHaveProperty("coordinates");
      expect(storedEntries()[0]).toEqual({ kind: LocationKind.DEVICE_TIME });
    });
  });

  // @add-city-coordinates-to-locations @FR6
  f.Scenario(
    "A namesake of the same zone is still a duplicate",
    ({ Given, When, Then, And }) => {
      Given(
        "the list holds {string} in {string} with the coordinates 39.8, -89.6",
        () => {
          storeDocument([], { hasDeviceTime: false });
          app = openLocationsApp();
          act(() => {
            app.result.current.addLocation({
              ...SPRINGFIELD,
              coordinates: { latitude: 39.8, longitude: -89.6 },
            });
          });
        },
      );
      When(
        "the user adds {string} in {string} with the coordinates 37.2, -93.3",
        () => {
          act(() => {
            outcome = app.result.current.addLocation({
              ...SPRINGFIELD,
              coordinates: { latitude: 37.2, longitude: -93.3 },
            });
          });
        },
      );
      Then("the location is rejected as a duplicate", () => {
        expect(outcome).toEqual({
          ok: false,
          error: LocationErrorCode.DUPLICATE_LOCATION,
        });
      });
      And("the listed {string} keeps the coordinates 39.8, -89.6", () => {
        expect(app.result.current.locations[0]?.coordinates).toEqual({
          latitude: 39.8,
          longitude: -89.6,
        });
      });
    },
  );

  // @add-city-coordinates-to-locations @FR9 @UX1
  f.ScenarioOutline(
    "Rows are unchanged",
    ({ Given, When, Then }, variables) => {
      const kazan = buildLocation({ label: "Kazan" });
      const kazanWithCoordinates = {
        ...kazan,
        coordinates: { latitude: 55.8, longitude: 49.1 },
      };
      const moscow = buildLocation({ label: "Moscow" });
      let withCoordinates: ReturnType<typeof presentBudgetRows> = [];
      Given("the list holds {string} with coordinates", () => undefined);
      When("the list is shown for the <view>", () => {
        const homeLocation = variables.view.startsWith("Grid")
          ? moscow
          : undefined;
        withCoordinates = presentBudgetRows([moscow, kazanWithCoordinates], {
          timestamp: BUDGET_FIRST_MOMENT,
          homeLocation,
        });
      });
      Then(
        "every row shows the same content as for {string} without coordinates",
        () => {
          const homeLocation = variables.view.startsWith("Grid")
            ? moscow
            : undefined;
          expect(withCoordinates).toEqual(
            presentBudgetRows([moscow, kazan], {
              timestamp: BUDGET_FIRST_MOMENT,
              homeLocation,
            }),
          );
          expect(withCoordinates).toHaveLength(2);
        },
      );
    },
  );
});
