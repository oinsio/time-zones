import type { FeatureDescriibeCallbackParams } from "@amiceli/vitest-cucumber";
import { describeFeature, loadFeature } from "@amiceli/vitest-cucumber";
import { expect } from "vitest";
import { APP_DEPLOY_INSTANT } from "@/constants";
import {
  createDeployTimeWorld,
  type HourFormatName,
  type LanguageName,
} from "./settings_deploy_time_world";

const feature = await loadFeature("../settings_deploy_time_unit.feature");
const DEFAULT_ZONE = "UTC";
const ENGLISH = "English";
const HOUR_FORMAT_24 = "24-hour";
const HOUR_FORMAT_12 = "12-hour";

describeFeature(feature, (f: FeatureDescriibeCallbackParams) => {
  const world = createDeployTimeWorld();
  let deviceZone = DEFAULT_ZONE;
  let textBeforeLater = "";

  f.BeforeEachScenario(async () => {
    await world.reset();
    deviceZone = DEFAULT_ZONE;
  });
  f.AfterAllScenarios(world.finish);

  const givenBuildInstant = (_ctx: unknown, buildInstant: string) =>
    expect(APP_DEPLOY_INSTANT).toBe(buildInstant);

  // @polish-settings-and-remove-offline-update-notice @FR5 @M3
  f.ScenarioOutline(
    "The deploy time in the interface language",
    ({ Given, And, When, Then }, variables) => {
      Given("the build was made at {string}", () =>
        givenBuildInstant(undefined, "2026-03-08T07:30:00.000Z"),
      );
      And("the device time zone is {string}", () => {
        deviceZone = variables.zone;
      });
      When(
        "the settings page is shown in {string} with the hour format {string}",
        () =>
          world.showSettings({
            zone: deviceZone,
            language: variables.language as LanguageName,
            hourFormat: variables["hour format"] as HourFormatName,
          }),
      );
      Then("the line after the language group reads {string}", () =>
        expect(world.deployTimeText()).toBe(variables.text),
      );
    },
  );

  // @polish-settings-and-remove-offline-update-notice @FR5
  f.Scenario(
    "The deploy time follows the settings at once",
    ({ Given, When, Then }) => {
      Given(
        "the settings page shows the deploy time in English with the hour format 24-hour",
        () =>
          world.showSettings({
            zone: DEFAULT_ZONE,
            language: ENGLISH,
            hourFormat: HOUR_FORMAT_24,
          }),
      );
      When("the user chooses the hour format 12-hour", () =>
        world.chooseHourFormat(HOUR_FORMAT_12),
      );
      Then("the deploy time shows its time in the 12-hour format", () =>
        expect(world.deployTimeText()).toBe(
          "Deployed March 8, 2026 at 7:30 AM",
        ),
      );
    },
  );

  // @polish-settings-and-remove-offline-update-notice @FR6
  f.Scenario(
    "The deploy time is fixed into the build",
    ({ Given, When, Then, And }) => {
      Given("the app was built at an instant", () => {
        textBeforeLater = "Deployed March 8, 2026 at 07:30";
      });
      And("the clock is a day later", () => undefined);
      And("the browser is offline", () => {
        vi.spyOn(navigator, "onLine", "get").mockReturnValue(false);
      });
      When("the settings page is shown", () =>
        world.showSettings({
          zone: DEFAULT_ZONE,
          language: ENGLISH,
          hourFormat: HOUR_FORMAT_24,
        }),
      );
      Then(
        "the deploy time shows the build instant, not the current time",
        () => expect(world.deployTimeText()).toBe(textBeforeLater),
      );
    },
  );
});
