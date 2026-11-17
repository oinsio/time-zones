// Verifies FR12, FR13, NFR-P3 of apply-data-updates-silently: the dump date in the city data attribution.
import type { FeatureDescriibeCallbackParams } from "@amiceli/vitest-cucumber";
import { describeFeature, loadFeature } from "@amiceli/vitest-cucumber";
import { screen, waitFor } from "@testing-library/react/pure";
import { expect, vi } from "vitest";
import { GEONAMES_URL } from "@/constants";
import { startWorkCount } from "@/test/workCounters";
import { TEST_CITY_DATA_DATE } from "../../../../../app.config";
import {
  createDeployTimeWorld,
  type LanguageName,
} from "./settings_deploy_time_world";
import { createSettingsLanguageWorld } from "./settingsLanguageWorld";

/** The dump date the mocked build fixes; the tests of other dates change it. */
const builtDate = vi.hoisted(() => ({ value: "2026-11-14" }));

vi.mock("@/constants", async (importOriginal) => {
  const original = await importOriginal<typeof import("@/constants")>();
  return new Proxy(original, {
    get: (target, key) =>
      key === "CITY_DATA_DATE" ? builtDate.value : Reflect.get(target, key),
  });
});

const feature = await loadFeature("../settings_city_data_date.feature");

const DEFAULT_ZONE = "UTC";
const ENGLISH = "English";
const HOUR_FORMAT_24 = "24-hour";
const RUSSIAN_NATIVE_NAME = "Русский";

describeFeature(feature, (f: FeatureDescriibeCallbackParams) => {
  const world = createDeployTimeWorld();
  const languageWorld = createSettingsLanguageWorld();
  let deviceZone = DEFAULT_ZONE;
  let language: LanguageName = ENGLISH;

  f.BeforeEachScenario(async () => {
    await world.reset();
    deviceZone = DEFAULT_ZONE;
    language = ENGLISH;
    builtDate.value = TEST_CITY_DATA_DATE;
  });
  f.AfterAllScenarios(async () => {
    await languageWorld.finish();
    await world.finish();
  });

  const showSettings = () =>
    world.showSettings({
      zone: deviceZone,
      language,
      hourFormat: HOUR_FORMAT_24,
    });
  const givenDumpDate = (_ctx: unknown, dumpDate: string) => {
    builtDate.value = dumpDate;
  };

  // @apply-data-updates-silently @FR12 @FR13
  f.ScenarioOutline(
    "The attribution in both languages",
    ({ Given, And, When, Then }, variables) => {
      Given(
        "the city data in use records the dump date {string}",
        givenDumpDate,
      );
      And('the interface language is "<language>"', () => {
        language = variables.language as LanguageName;
      });
      When("the user opens the settings", showSettings);
      Then(
        'a link named "<attribution>" to {string} is shown',
        (_ctx, url: string) => {
          const link = screen.getByRole("link", {
            name: world.cityDataAttributionText(),
          });
          expect(world.cityDataAttributionText()).toBe(variables.attribution);
          expect(link).toHaveAttribute("href", url);
          expect(url).toBe(GEONAMES_URL);
        },
      );
      And("it stands below the last settings group", () => {
        const [lastElement] = world.elementsAfterDeployTime().slice(-1);
        expect(lastElement).toHaveAttribute("href", GEONAMES_URL);
      });
    },
  );

  // @apply-data-updates-silently @FR12
  f.ScenarioOutline(
    "The date does not depend on the device time zone",
    ({ Given, And, When, Then }, variables) => {
      Given(
        "the city data in use records the dump date {string}",
        givenDumpDate,
      );
      And('the device time zone is "<zone>"', () => {
        deviceZone = String(variables.zone);
      });
      When("the settings page is shown in English", showSettings);
      Then("the attribution names November 14, 2026", () => {
        expect(world.cityDataAttributionText()).toContain("November 14, 2026");
      });
    },
  );

  // @apply-data-updates-silently @FR12
  f.Scenario(
    "The date follows the language at once",
    ({ Given, When, Then }) => {
      // The app applies the chosen language to the page, so this scenario runs the whole shell.
      Given("the settings page shows the attribution in English", async () => {
        await languageWorld.reset();
        languageWorld.openApp();
        await languageWorld.openSettings();
        expect(world.cityDataAttributionText()).toContain("November 14, 2026");
      });
      When("the user chooses Russian", () =>
        languageWorld.chooseLanguage(RUSSIAN_NATIVE_NAME),
      );
      Then(
        "the attribution reads {string} without a reload",
        (_ctx, text: string) =>
          waitFor(() => expect(world.cityDataAttributionText()).toBe(text)),
      );
    },
  );

  // @apply-data-updates-silently @FR12
  f.Scenario("The date follows the build", ({ Given, When, Then }) => {
    Given(
      "the running build fixes the dump date {string}, whatever date the device stores or the network serves",
      givenDumpDate,
    );
    When("the user opens the settings in English", showSettings);
    Then("the attribution names December 14, 2026", () => {
      expect(world.cityDataAttributionText()).toContain("December 14, 2026");
    });
  });

  // @apply-data-updates-silently @FR13 @NFR-P3
  f.Scenario("No formatter on a tick", ({ Given, When, Then }) => {
    let workCount: ReturnType<typeof startWorkCount>;
    Given("the settings page is shown", async () => {
      await showSettings();
      workCount = startWorkCount();
    });
    When("a minute passes", () => world.runMinuteTick());
    Then("no date formatter was built", () => {
      workCount.stop();
      expect(workCount.formatters()).toBe(0);
    });
  });
});
