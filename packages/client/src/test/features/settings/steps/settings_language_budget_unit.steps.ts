// Verifies NFR-P1 of add-interface-language-selection (D7): work is counted, never timed.
import type { FeatureDescriibeCallbackParams } from "@amiceli/vitest-cucumber";
import { describeFeature, loadFeature } from "@amiceli/vitest-cucumber";
import { HourFormat } from "@/preferences";
import { createHourFormatBudgetCheck } from "./hourFormatBudgetWorld";

const feature = await loadFeature("../settings_language_budget_unit.feature");

const ENGLISH = "en";
const RUSSIAN = "ru";
const HOUR_FORMAT = HourFormat.H24;

describeFeature(feature, (f: FeatureDescriibeCallbackParams) => {
  const budget = createHourFormatBudgetCheck();

  f.AfterEachScenario(budget.stop);

  // @add-interface-language-selection @NFR-P1
  f.Scenario(
    "Presenting again with the same language builds no formatter",
    ({ Given, When, Then }) => {
      Given("50 locations have been presented in English", () =>
        budget.presentOnce(HOUR_FORMAT, false, ENGLISH),
      );
      When("the same rows are presented again in English", () =>
        budget.presentAgain(HOUR_FORMAT, ENGLISH),
      );
      Then("no formatter is built", budget.expectNoFormatter);
    },
  );

  // @add-interface-language-selection @NFR-P1
  f.Scenario(
    "Switching the language builds one formatter per zone and kind",
    ({ Given, When, Then }) => {
      Given(
        "50 locations in 50 different time zones have been presented in English",
        () => budget.presentOnce(HOUR_FORMAT, true, ENGLISH),
      );
      When(
        "the interface language becomes Russian and the rows are presented",
        () => budget.presentAgain(HOUR_FORMAT, RUSSIAN),
      );
      Then(
        "at most one formatter per time zone and label kind in use is built",
        budget.expectOneFormatterPerZoneAndKind,
      );
    },
  );
});
