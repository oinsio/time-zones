// Verifies FR5, FR6, NFR-P1 of add-settings-page-and-device-time-location.
import type { FeatureDescriibeCallbackParams } from "@amiceli/vitest-cucumber";
import { describeFeature, loadFeature } from "@amiceli/vitest-cucumber";
import { screen, within } from "@testing-library/react/pure";
import userEvent from "@testing-library/user-event";
import i18n from "i18next";
import { expect } from "vitest";
import { DEFAULT_LANGUAGE } from "@/locales";
import { getDayPeriodMarkers, parseWallTimeInput } from "@/presenter";
import { getCardOf } from "../../locations/steps/deviceTimeQueries";
import { createHourFormatBudgetCheck } from "./hourFormatBudgetWorld";
import { createHourFormatWorld, hourFormatOf } from "./hourFormatWorld";

const feature = await loadFeature("../settings_hour_format_unit.feature");

describeFeature(feature, (f: FeatureDescriibeCallbackParams) => {
  const world = createHourFormatWorld();
  const budget = createHourFormatBudgetCheck();
  const {
    givenLanguage,
    givenHourFormat,
    givenZone,
    givenInstant,
    givenList,
    openApp,
  } = world;
  const expectCardShowsTime = (_ctx: unknown, city: string, time: string) =>
    expect(within(getCardOf(city)).getByText(time)).toBeVisible();
  const confirmInOpenField = async (text: string) => {
    await userEvent.clear(screen.getByRole("textbox"));
    await userEvent.type(screen.getByRole("textbox"), `${text}{Enter}`);
  };

  f.BeforeEachScenario(world.reset);
  f.AfterEachScenario(budget.stop);
  f.AfterAllScenarios(world.finish);

  // @add-settings-page-and-device-time-location @FR5
  f.Scenario("Gap note in 12-hour format", ({ Given, And, When, Then }) => {
    Given("the interface language is {string}", givenLanguage);
    And("the hour format is {string}", givenHourFormat);
    And("the device time zone is {string}", givenZone);
    And("the current instant is {string}", givenInstant);
    And("the list is {string}", givenList);
    And("the app is open", openApp);
    When("the user moves to the next day", world.showNextDay);
    Then(
      "the gap note names {string} as the requested time and {string} as the shown time",
      (_ctx, requestedTime: string, shownTime: string) =>
        expect(world.gapNote()).toBe(
          i18n.t("date.gapNote", { requestedTime, shownTime }),
        ),
    );
  });

  // @add-settings-page-and-device-time-location @FR5
  f.Scenario("Time in the 12-hour format", ({ Given, And, Then }) => {
    Given("the interface language is {string}", givenLanguage);
    And("the hour format is {string}", givenHourFormat);
    And("the current instant is {string}", givenInstant);
    And("the list is {string}", givenList);
    And("the app is open", openApp);
    Then("the {string} row shows the time {string}", expectCardShowsTime);
    And("the {string} row also shows the time {string}", expectCardShowsTime);
  });

  // @add-settings-page-and-device-time-location @FR5
  f.Scenario("Hour labels in the 12-hour format", ({ Given, And, Then }) => {
    Given("the device time zone is {string}", givenZone);
    And("the interface language is {string}", givenLanguage);
    And("the hour format is {string}", givenHourFormat);
    And("the current instant is {string}", givenInstant);
    And("the list is {string}", givenList);
    And("the app is open", openApp);
    Then(
      "the hour labels of {string} are {string}",
      (_ctx, city: string, labels: string) =>
        expect(world.hourLabelsOf(city)).toBe(labels),
    );
    And(
      "the hour labels of {string} are also {string}",
      (_ctx, city: string, labels: string) =>
        expect(world.hourLabelsOf(city)).toBe(labels),
    );
  });

  // @add-settings-page-and-device-time-location @FR5
  f.Scenario(
    "Open the field in the 12-hour format",
    ({ Given, And, When, Then }) => {
      Given("the interface language is {string}", givenLanguage);
      And("the hour format is {string}", givenHourFormat);
      And("the current instant is {string}", givenInstant);
      And("the list is {string}", givenList);
      And("the app is open", openApp);
      let field: HTMLInputElement;
      When(
        "the user opens the wall-time input of {string}",
        async (_ctx, city: string) => {
          field = await world.openWallTimeInput(city);
        },
      );
      Then("the field holds {string}, fully selected", (_ctx, text: string) => {
        expect(field.value).toBe(text);
        expect([field.selectionStart, field.selectionEnd]).toEqual([
          0,
          text.length,
        ]);
      });
    },
  );

  // @add-settings-page-and-device-time-location @FR6
  f.ScenarioOutline("Accepted 12-hour texts", ({ When, Then }, variables) => {
    let parsedTime: string | undefined;
    When("the user confirms the text {string}", () => {
      parsedTime = parseWallTimeInput(
        variables.text,
        getDayPeriodMarkers(DEFAULT_LANGUAGE),
      );
    });
    Then("the typed wall-clock time is {string}", () =>
      expect(parsedTime).toBe(variables.time),
    );
  });

  // @add-settings-page-and-device-time-location @FR6
  f.ScenarioOutline(
    "Rejected 12-hour texts",
    ({ Given, And, When, Then }, variables) => {
      Given("the interface language is {string}", givenLanguage);
      And("the list is {string}", givenList);
      And("the app is open", openApp);
      And("the moment is live", () =>
        expect(world.isMomentPinned()).toBe(false),
      );
      When(
        "the user confirms the text {string} in the wall-time input of {string}",
        async (_ctx, _text: string, city: string) => {
          await world.openWallTimeInput(city);
          await confirmInOpenField(variables.text);
        },
      );
      Then("the field shows the error {string}", (_ctx, message: string) =>
        expect(screen.getByText(message)).toBeVisible(),
      );
      And("the moment is still live", () =>
        expect(world.isMomentPinned()).toBe(false),
      );
    },
  );

  // @add-settings-page-and-device-time-location @FR6
  f.ScenarioOutline(
    "The shown time is accepted unchanged",
    ({ Given, And, When, Then }, variables) => {
      Given("the hour format is {string}", () =>
        givenHourFormat(undefined, variables.format),
      );
      And("the interface language is {string}", () =>
        givenLanguage(undefined, variables.language),
      );
      And("the current instant is {string}", givenInstant);
      And("the list is {string}", givenList);
      And("the app is open", openApp);
      When(
        "the user opens the wall-time input of {string} and confirms its initial text",
        async (_ctx, city: string) => {
          const field = await world.openWallTimeInput(city);
          await userEvent.type(field, "{Enter}");
        },
      );
      Then("the moment is pinned to {string}", (_ctx, timestamp: string) => {
        expect(world.isMomentPinned()).toBe(true);
        expect(world.shownInstant()).toBe(timestamp);
      });
    },
  );

  // @add-settings-page-and-device-time-location @NFR-P1 @M7
  f.Scenario(
    "Presenting again builds no formatter",
    ({ Given, When, Then }) => {
      Given(
        "50 locations have been presented in the hour format {string}",
        (_ctx, optionName: string) =>
          budget.presentOnce(hourFormatOf(optionName)),
      );
      When("the same rows are presented again for the next minute tick", () =>
        budget.presentAgain(hourFormatOf("24-hour")),
      );
      Then("no formatter is built", budget.expectNoFormatter);
    },
  );

  // @add-settings-page-and-device-time-location @NFR-P1 @M7
  f.Scenario(
    "Switching the hour format builds one formatter per zone and kind",
    ({ Given, When, Then }) => {
      Given(
        "50 locations in 50 different time zones have been presented in the hour format {string}",
        (_ctx, optionName: string) =>
          budget.presentOnce(hourFormatOf(optionName), true),
      );
      When(
        "the hour format becomes {string} and the rows are presented",
        (_ctx, optionName: string) =>
          budget.presentAgain(hourFormatOf(optionName)),
      );
      Then(
        "at most one formatter per time zone and label kind in use is built",
        budget.expectOneFormatterPerZoneAndKind,
      );
    },
  );
});
