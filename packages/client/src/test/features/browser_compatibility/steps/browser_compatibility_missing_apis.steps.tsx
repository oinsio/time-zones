import type { FeatureDescriibeCallbackParams } from "@amiceli/vitest-cucumber";
import { describeFeature, loadFeature } from "@amiceli/vitest-cucumber";
import { act, renderHook, screen } from "@testing-library/react/pure";
import i18n from "i18next";
import { expect, vi } from "vitest";
import { usePrefersReducedMotion } from "@/controller";
import { loadLegacySupport } from "@/lib/legacy";
import { Temporal } from "@/lib/temporal";
import { HourFormat } from "@/preferences";
import type { PresentedSearchResult } from "@/presenter";
import { presentLocationRows, presentSearchResults } from "@/presenter";
import { UNIT_TEST_DEVICE_TIME_ZONE } from "@/test/deviceTimeZone";
import { buildLocation, KNOWN_CITIES } from "@/test/factories/buildLocation";
import {
  buildCitySearch,
  createSearchWorld,
  runSearch,
} from "@/test/features/location_search/steps/searchWorld";
import {
  closeApp,
  openApp,
} from "@/test/features/locations/steps/locationsUiWorld";
import { buildReferenceDay } from "@/test/referenceDay";
import {
  buildLegacyMediaQueryList,
  stubLegacyEngine,
} from "./legacyEngineStubs";

vi.mock(
  "virtual:pwa-register/react",
  async () =>
    (await import("@/test/fakeServiceWorker")).fakeServiceWorkerModule,
);

const feature = await loadFeature(
  "../browser_compatibility_missing_apis.feature",
);

const LANGUAGE = "en";
const SAMPLE_INSTANT = "2026-03-08T07:30:00Z";

describeFeature(feature, (f: FeatureDescriibeCallbackParams) => {
  let restoreEngine: () => void = () => undefined;
  let locations: ReturnType<typeof buildLocation>[] = [];
  let rows: ReturnType<typeof presentLocationRows> = [];
  let presented: PresentedSearchResult[] = [];
  let mediaQueryList = buildLegacyMediaQueryList();
  let reducedMotion: ReturnType<typeof renderHook<boolean, unknown>>;

  f.BeforeEachScenario(async () => {
    closeApp();
    restoreEngine = () => undefined;
    locations = [];
    rows = [];
    presented = [];
    mediaQueryList = buildLegacyMediaQueryList();
    await i18n.changeLanguage(LANGUAGE);
  });
  f.AfterEachScenario(() => {
    reducedMotion?.unmount();
    restoreEngine();
    vi.unstubAllGlobals();
  });
  f.AfterAllScenarios(() => closeApp());

  const givenNoCountryNames = () => {
    restoreEngine = stubLegacyEngine();
  };
  const givenLegacyQueryList = () => {
    restoreEngine = stubLegacyEngine(mediaQueryList);
  };

  // @support-legacy-ios-12-safari @FR5 @UX3
  f.Scenario("Rows without country names", ({ Given, And, When, Then }) => {
    Given("the environment has no country names", givenNoCountryNames);
    And("the list contains {string}", (_ctx, city: string) => {
      locations = [buildLocation({ label: city, ...KNOWN_CITIES[city] })];
    });
    When("the rows are presented", () => {
      const instant = Temporal.Instant.from(SAMPLE_INSTANT);
      rows = presentLocationRows(locations, {
        language: LANGUAGE,
        hourFormat: HourFormat.H24,
        instant,
        translate: i18n.t,
        deviceTimeZoneId: UNIT_TEST_DEVICE_TIME_ZONE,
        homeLocationId: null,
        referenceOffsetMinutes: undefined,
        referenceDay: buildReferenceDay(instant),
      });
    });
    Then("the {string} row has an empty country name", (_ctx, city: string) => {
      expect(rows.map((row) => [row.cityLabel, row.countryName])).toEqual([
        [city, ""],
      ]);
    });
    And("no error is thrown", () => {
      expect(rows).toHaveLength(1);
    });
  });

  // @support-legacy-ios-12-safari @FR5 @UX3
  f.Scenario(
    "Search results without country names",
    ({ Given, When, Then }) => {
      Given("the environment has no country names", givenNoCountryNames);
      When("the user searches for {string}", (_ctx, query: string) => {
        const world = { ...createSearchWorld(), citySearch: buildCitySearch() };
        runSearch(world, query);
        presented = presentSearchResults(world.results, [], {
          language: LANGUAGE,
          cityNameLanguage: LANGUAGE,
        });
      });
      Then(
        "{string} is among the presented results with an empty country name",
        (_ctx, city: string) => {
          const match = presented.find((result) => result.cityName === city);
          expect(match?.countryName).toBe("");
        },
      );
    },
  );

  // @support-legacy-ios-12-safari @FR6
  f.Scenario(
    "View selection without ResizeObserver",
    ({ Given, When, Then, And }) => {
      Given(
        "the environment has no native width observation",
        givenNoCountryNames,
      );
      When("the app starts", async () => {
        await loadLegacySupport();
        await openApp();
      });
      Then("width observation is available to the app", () => {
        expect(globalThis.ResizeObserver).toBeTypeOf("function");
      });
      And("the Cards view is shown", () => {
        expect(screen.getAllByRole("listitem")).toHaveLength(1);
      });
    },
  );

  const readPreference = () => {
    reducedMotion = renderHook(() => usePrefersReducedMotion());
  };

  // @support-legacy-ios-12-safari @FR7
  f.Scenario(
    "Preference followed through addListener",
    ({ Given, And, When, Then }) => {
      Given(
        "the reduced-motion query list has only the old listener methods",
        givenLegacyQueryList,
      );
      And("the reduced-motion preference is off", readPreference);
      When("the reduced-motion preference turns on", () => {
        act(() => mediaQueryList.setMatches(true));
      });
      Then("the app treats motion as reduced", () => {
        expect(reducedMotion.result.current).toBe(true);
      });
    },
  );

  // @support-legacy-ios-12-safari @FR7
  f.Scenario("Listener removed on unmount", ({ Given, When, Then }) => {
    Given(
      "the reduced-motion query list has only the old listener methods",
      givenLegacyQueryList,
    );
    When("the component that reads the preference unmounts", () => {
      readPreference();
      expect(mediaQueryList.listenerCount()).toBe(1);
      reducedMotion.unmount();
    });
    Then("its listener is removed", () => {
      expect(mediaQueryList.listenerCount()).toBe(0);
    });
  });
});
