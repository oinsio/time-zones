import type { FeatureDescriibeCallbackParams } from "@amiceli/vitest-cucumber";
import { describeFeature, loadFeature } from "@amiceli/vitest-cucumber";
// "pure" skips auto-cleanup: each step is its own test, the page must survive between steps.
import { screen } from "@testing-library/react/pure";
import i18n from "i18next";
import { expect, vi } from "vitest";
import { bootApp, loadLegacySupport } from "@/lib/legacy";
import {
  closeApp,
  listedCityLabels,
  openApp,
  seedStoredList,
} from "@/test/features/locations/steps/locationsUiWorld";
import { buildLegacyCoreJsModules } from "../../../../../scripts/legacyCoreJs/buildLegacyCoreJsModules";
import { stubLegacyEngine } from "./legacyEngineStubs";

vi.mock(
  "virtual:pwa-register/react",
  async () =>
    (await import("@/test/fakeServiceWorker")).fakeServiceWorkerModule,
);

const feature = await loadFeature(
  "../browser_compatibility_legacy_boot.feature",
);

const TIME_LABEL_PATTERN = /\d{2}:\d{2}/;
const POLYFILLS_STEP = "polyfills";
const APP_STEP = "app";

describeFeature(feature, (f: FeatureDescriibeCallbackParams) => {
  let loadOrder: string[] = [];
  let hasLegacyEngine = false;
  let restoreEngine: () => void = () => undefined;
  let errorLog: ReturnType<typeof vi.spyOn>;

  const startApp = () =>
    bootApp({
      needsLegacySupport: () => hasLegacyEngine,
      loadLegacySupport: async () => {
        await loadLegacySupport();
        loadOrder.push(POLYFILLS_STEP);
      },
      loadApp: async () => {
        loadOrder.push(APP_STEP);
      },
    });

  f.BeforeEachScenario(async () => {
    closeApp();
    loadOrder = [];
    hasLegacyEngine = false;
    restoreEngine = () => undefined;
    errorLog = vi.spyOn(console, "error").mockImplementation(() => undefined);
    await i18n.changeLanguage("en");
  });
  f.AfterEachScenario(() => {
    restoreEngine();
    errorLog.mockRestore();
    vi.unstubAllGlobals();
    vi.resetModules();
  });
  f.AfterAllScenarios(() => closeApp());

  // @support-legacy-ios-12-safari @FR1
  f.Scenario(
    "Main page renders on a legacy engine",
    ({ Given, And, When, Then }) => {
      Given(
        "the engine lacks country names, width observation, Pointer Events and media query listeners",
        () => {
          restoreEngine = stubLegacyEngine();
        },
      );
      And(
        "the stored list is {string}, {string}",
        (_ctx: unknown, ...cities: string[]) => seedStoredList(cities),
      );
      When("the user opens the app", async () => {
        await loadLegacySupport();
        await openApp();
      });
      Then(
        "the cards of {string} and {string} show their times",
        (_ctx, firstCity: string, secondCity: string) => {
          const [firstRow, secondRow] = screen.getAllByRole("listitem");
          expect(firstRow).toHaveTextContent(firstCity);
          expect(secondRow).toHaveTextContent(secondCity);
          expect(listedCityLabels()).toHaveLength(2);
          expect(firstRow).toHaveTextContent(TIME_LABEL_PATTERN);
          expect(secondRow).toHaveTextContent(TIME_LABEL_PATTERN);
        },
      );
      And("no error is shown", () => {
        expect(errorLog).not.toHaveBeenCalled();
      });
    },
  );

  // @support-legacy-ios-12-safari @FR2
  f.Scenario(
    "Modern engine skips the polyfills",
    ({ Given, When, Then, And }) => {
      Given("the engine has every required built-in", () => {
        hasLegacyEngine = false;
      });
      When("the app starts", startApp);
      Then("the polyfills are not loaded", () => {
        expect(loadOrder).not.toContain(POLYFILLS_STEP);
      });
      And("the app is loaded", () => {
        expect(loadOrder).toEqual([APP_STEP]);
      });
    },
  );

  // @support-legacy-ios-12-safari @FR2
  f.Scenario(
    "Legacy engine installs the polyfills first",
    ({ Given, When, Then, And }) => {
      Given("the engine lacks {string}", () => {
        hasLegacyEngine = true;
      });
      When("the app starts", startApp);
      Then("the polyfills are loaded before the app", () => {
        expect(loadOrder).toEqual([POLYFILLS_STEP, APP_STEP]);
      });
      And("the polyfills include {string}", (_ctx, polyfill: string) => {
        expect(buildLegacyCoreJsModules()).toContain(polyfill);
      });
    },
  );
});
