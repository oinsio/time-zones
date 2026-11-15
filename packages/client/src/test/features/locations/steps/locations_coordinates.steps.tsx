// Implements FR6, FR9, UX1 of add-city-coordinates-to-locations: coordinates of a city location.
import type { FeatureDescriibeCallbackParams } from "@amiceli/vitest-cucumber";
import { describeFeature, loadFeature } from "@amiceli/vitest-cucumber";
// "pure" skips auto-cleanup: each step is its own test, the app must survive between steps.
import { waitFor } from "@testing-library/react/pure";
import i18n from "i18next";
import { expect, vi } from "vitest";
import { STORAGE_KEYS } from "@/constants";
import type { Coordinates } from "@/model";
import {
  closeApp,
  openApp as openRealApp,
  searchAndChoose,
} from "./locationsUiWorld";

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

describeFeature(feature, (f: FeatureDescriibeCallbackParams) => {
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
});
