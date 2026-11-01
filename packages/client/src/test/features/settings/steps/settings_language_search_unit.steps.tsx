// Verifies FR6 of add-interface-language-selection.
import type { FeatureDescriibeCallbackParams } from "@amiceli/vitest-cucumber";
import { describeFeature, loadFeature } from "@amiceli/vitest-cucumber";
import { cleanup, render, screen, within } from "@testing-library/react/pure";
import userEvent from "@testing-library/user-event";
import i18n from "i18next";
import { expect } from "vitest";
import { InterfaceLanguageGroup } from "@/app/settings/InterfaceLanguageGroup";
import { localeRegistry, type RegisteredLocale } from "@/locales";
import { TEN_LOCALES } from "@/test/factories/localeFixtures";

const feature = await loadFeature("../settings_language_search_unit.feature");

const TEN = 10;
const NO_OP = () => undefined;

describeFeature(feature, (f: FeatureDescriibeCallbackParams) => {
  let locales: readonly RegisteredLocale[] = [];

  const expandGroup = async () => {
    render(
      <InterfaceLanguageGroup
        locales={locales}
        activeCode="en"
        onChoose={NO_OP}
      />,
    );
    await userEvent.click(screen.getByRole("button", { name: /^Language:/ }));
  };
  const givenLocales = (_ctx: unknown, count: number) => {
    locales = count === TEN ? TEN_LOCALES : localeRegistry.slice(0, count);
  };

  f.BeforeEachScenario(async () => {
    await i18n.changeLanguage("en");
  });
  f.AfterEachScenario(cleanup);
  f.AfterAllScenarios(async () => {
    await i18n.changeLanguage("ru");
  });

  // @add-interface-language-selection @FR6
  f.Scenario("No search field below the threshold", ({ Given, When, Then }) => {
    Given("the registry holds {int} locales", givenLocales);
    When("the user expands the language group", expandGroup);
    Then("no search field is shown", () =>
      expect(screen.queryByRole("searchbox")).not.toBeInTheDocument(),
    );
  });

  // @add-interface-language-selection @FR6
  f.ScenarioOutline(
    "Filtering at the threshold",
    ({ Given, When, Then }, variables) => {
      Given("the registry holds {int} locales", givenLocales);
      When(
        'the user expands the language group and types "<text>"',
        async () => {
          await expandGroup();
          await userEvent.type(
            screen.getByRole("searchbox"),
            String(variables.text),
          );
        },
      );
      Then('the rows are "<rows>"', () => {
        const rows = within(screen.getByRole("list")).getAllByRole("button");
        expect(
          rows.map((row) => row.querySelector("[lang]")?.textContent),
        ).toEqual([String(variables.rows)]);
      });
    },
  );

  // @add-interface-language-selection @FR6
  f.Scenario("Nothing found", ({ Given, When, Then }) => {
    Given("the registry holds {int} locales", givenLocales);
    When('the user expands the language group and types "zzz"', async () => {
      await expandGroup();
      await userEvent.type(screen.getByRole("searchbox"), "zzz");
    });
    Then('the list shows "No languages found"', () =>
      expect(screen.getByText("No languages found")).toBeInTheDocument(),
    );
  });
});
