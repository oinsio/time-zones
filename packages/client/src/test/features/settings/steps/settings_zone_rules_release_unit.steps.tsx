// Verifies FR8 of add-remote-zone-rules-updates: the zone rules release line of the settings page.
import type { FeatureDescriibeCallbackParams } from "@amiceli/vitest-cucumber";
import { describeFeature, loadFeature } from "@amiceli/vitest-cucumber";
import { cleanup, render } from "@testing-library/react/pure";
import i18n from "i18next";
import { expect, vi } from "vitest";
import {
  createInMemoryLocationRepository,
  createInMemoryPreferencesRepository,
} from "@/adapters";
import { SettingsPage } from "@/app/settings";
import { GEONAMES_URL } from "@/constants";
import { LocationsProvider, PreferencesProvider } from "@/controller";
import { fakeClock } from "@/lib/temporal";
import * as zoneRules from "@/lib/zoneRules";
import { createManualTickScheduler } from "@/test/tickSchedulers";
import {
  createManualWriteScheduler,
  immediateWriteScheduler,
} from "@/test/writeSchedulers";

const feature = await loadFeature(
  "../settings_zone_rules_release_unit.feature",
);

const LINE_SELECTOR = "[data-zone-rules-release]";
const DEPLOY_TIME_SELECTOR = "[data-deploy-time]";
const LANGUAGE_CODE_BY_NAME: Record<string, string> = {
  English: "en",
  Russian: "ru",
};

describeFeature(feature, (f: FeatureDescriibeCallbackParams) => {
  let container: HTMLElement;

  const activate = (release: string | undefined) => {
    vi.spyOn(zoneRules, "getInstalledRelease").mockReturnValue(
      release === undefined ? undefined : { release, zones: new Map() },
    );
  };
  const showSettings = async (_ctx: unknown, languageName: string) => {
    await i18n.changeLanguage(LANGUAGE_CODE_BY_NAME[languageName]);
    container = render(
      <PreferencesProvider
        repository={createInMemoryPreferencesRepository()}
        writeScheduler={createManualWriteScheduler()}
      >
        <LocationsProvider
          repository={createInMemoryLocationRepository()}
          writeScheduler={immediateWriteScheduler}
          clock={fakeClock("2026-11-06T10:30:00Z")}
          tickScheduler={createManualTickScheduler()}
        >
          <SettingsPage notices={null} onBack={() => undefined} />
        </LocationsProvider>
      </PreferencesProvider>,
    ).container;
  };
  const expectLineAfterDeployTime = (_ctx: unknown, text: string) => {
    const line = container.querySelector(LINE_SELECTOR);
    expect(line?.previousElementSibling).toBe(
      container.querySelector(DEPLOY_TIME_SELECTOR),
    );
    expect(line).toHaveTextContent(text);
  };

  f.AfterEachScenario(async () => {
    cleanup();
    vi.restoreAllMocks();
    await i18n.changeLanguage("ru");
  });

  // @add-remote-zone-rules-updates @FR8
  f.ScenarioOutline(
    "The line in both languages",
    ({ Given, When, Then }, variables) => {
      Given("the active release is {string}", (_ctx, release: string) =>
        activate(release),
      );
      When('the settings page is shown in "<language>"', () =>
        showSettings(undefined, String(variables.language)),
      );
      Then('the line after the deploy time reads "<text>"', () =>
        expectLineAfterDeployTime(undefined, String(variables.text)),
      );
    },
  );

  // @add-remote-zone-rules-updates @FR8
  f.Scenario("The line names the active release", ({ Given, When, Then }) => {
    Given(
      "the bundled release is {string} and the stored release {string} is active",
      (_ctx, _bundled: string, stored: string) => activate(stored),
    );
    When("the settings page is shown in {string}", showSettings);
    Then(
      "the line after the deploy time reads {string}",
      expectLineAfterDeployTime,
    );
  });

  // @add-remote-zone-rules-updates @FR8 @add-geonames-city-source @FR13 @UX4
  f.Scenario("No active release", ({ Given, When, Then }) => {
    Given("the zone rules failed to load at start", () => activate(undefined));
    When("the settings page is shown in {string}", showSettings);
    Then(
      "the deploy time is the last line before the city data attribution and no release line is shown",
      () => {
        const main = container.querySelector("main") as HTMLElement;
        const deployTime = container.querySelector(DEPLOY_TIME_SELECTOR);
        expect(deployTime?.nextElementSibling).toBe(main.lastElementChild);
        expect(main.lastElementChild).toHaveAttribute("href", GEONAMES_URL);
        expect(container.querySelector(LINE_SELECTOR)).toBeNull();
      },
    );
  });
});
