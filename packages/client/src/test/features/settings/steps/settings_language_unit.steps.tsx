// Verifies FR5, FR7, FR8, FR12, UX3 of add-interface-language-selection.
import type { FeatureDescriibeCallbackParams } from "@amiceli/vitest-cucumber";
import { describeFeature, loadFeature } from "@amiceli/vitest-cucumber";
import { screen, waitFor } from "@testing-library/react/pure";
import userEvent from "@testing-library/user-event";
import i18n from "i18next";
import { expect, vi } from "vitest";
import { createSettingsLanguageWorld } from "./settingsLanguageWorld";

vi.mock(
  "virtual:pwa-register/react",
  async () =>
    (await import("@/test/fakeServiceWorker")).fakeServiceWorkerModule,
);

const feature = await loadFeature("../settings_language_unit.feature");

const RUSSIAN_MAIN_HEADING = "Часовые пояса";
const RUSSIAN_SETTINGS_HEADING = "Настройки";
const RUSSIAN_BUTTON_LABEL = "Язык: Русский";
const FLAG_TEXT_ENGLISH = "🇺🇸English";
const FLAG_TEXT_RUSSIAN = "🇷🇺Русский";

describeFeature(feature, (f: FeatureDescriibeCallbackParams) => {
  const world = createSettingsLanguageWorld();
  const expectMainHeadingInRussian = () =>
    expect(
      screen.getByRole("heading", { name: RUSSIAN_MAIN_HEADING }),
    ).toBeInTheDocument();

  f.BeforeEachScenario(world.reset);
  f.AfterAllScenarios(world.finish);

  // @add-interface-language-selection @FR5 @UX3
  f.Scenario(
    "Choosing Russian applies at once",
    ({ Given, And, When, Then }) => {
      Given("the interface language is English", () => undefined);
      And("the current instant is {string}", (_ctx, isoInstant: string) =>
        world.setInstant(isoInstant),
      );
      And("the list is Almaty", () => world.storeAlmatyList());
      When("the user chooses «Русский» in the language group", async () => {
        world.openApp();
        await world.openSettings();
        await world.chooseLanguage("Русский");
      });
      Then('the list collapses and the button shows "🇷🇺 Русский"', () => {
        expect(screen.queryByRole("list")).not.toBeInTheDocument();
        expect(world.languageButton()).toHaveTextContent(FLAG_TEXT_RUSSIAN);
      });
      And("the settings heading reads «Настройки» without a reload", () => {
        expect(
          screen.getByRole("heading", { name: RUSSIAN_SETTINGS_HEADING }),
        ).toBeInTheDocument();
      });
      And(
        "after going back Almaty keeps its city label and shows the country «Казахстан»",
        async () => {
          await world.goBack();
          expect(await screen.findByText("Almaty")).toBeInTheDocument();
          expect(await screen.findByText(/Казахстан/)).toBeInTheDocument();
          expect(document.documentElement.lang).toBe("ru");
        },
      );
      And("searching {string} offers «Алматы»", async (_ctx, query: string) => {
        await userEvent.click(
          screen.getByRole("button", { name: i18n.t("locations.addLocation") }),
        );
        await userEvent.type(await screen.findByRole("combobox"), query);
        expect(
          await screen.findByRole("option", { name: /Алматы/ }),
        ).toBeInTheDocument();
      });
    },
  );

  // @add-interface-language-selection @FR3 @UX1
  f.Scenario("Names are not translated", ({ Given, When, Then }) => {
    Given("the interface language is Russian", () =>
      world.storeChosenLanguage("ru"),
    );
    When("the user expands the language group", async () => {
      await world.reopenApp();
      await world.openSettings();
      await world.expandLanguageGroup();
    });
    Then('the rows read "🇺🇸 English" and "🇷🇺 Русский"', () => {
      expect(world.languageRows().map((row) => row.textContent)).toEqual([
        FLAG_TEXT_ENGLISH,
        FLAG_TEXT_RUSSIAN,
      ]);
    });
  });

  // @add-interface-language-selection @FR7
  f.Scenario("The language survives a reload", ({ Given, And, When, Then }) => {
    Given("the browser language is {string}", (_ctx, language: string) =>
      world.setBrowserLanguage(language),
    );
    And("the user chose «Русский» in the language group", async () => {
      world.openApp();
      await world.openSettings();
      await world.chooseLanguage("Русский");
      await world.flushWrites();
    });
    When("the app is opened again", world.reopenApp);
    Then("the main page is in Russian from its first render", () =>
      expectMainHeadingInRussian(),
    );
    And('the language button shows "🇷🇺 Русский"', async () => {
      await world.openSettings();
      expect(world.languageButton()).toHaveTextContent(FLAG_TEXT_RUSSIAN);
    });
  });

  // @add-interface-language-selection @FR8
  f.Scenario(
    "Migration of the previous document",
    ({ Given, When, Then, And }) => {
      Given(
        "the previous version stored the theme Dark and the hour format 12-hour, and the legacy language key holds {string}",
        (_ctx, language: string) => {
          world.storePreferences(1, { theme: "DARK", hourFormat: "H12" });
          world.storeLegacyLanguage(language);
        },
      );
      When("the app is opened again", world.reopenApp);
      Then("the language «Русский» is in force", async () => {
        expectMainHeadingInRussian();
        await world.openSettings();
        expect(world.languageButton()).toHaveAccessibleName(
          RUSSIAN_BUTTON_LABEL,
        );
      });
      When(
        "the user chooses the hour format {string}",
        async (_ctx, name: string) => {
          await world.chooseHourFormat(name);
          await world.flushWrites();
        },
      );
      Then(
        "the stored document holds the theme Dark, the hour format 24-hour and the language {string}",
        (_ctx, language: string) => {
          expect(world.storedPreferencesPayload()).toEqual({
            theme: "DARK",
            hourFormat: "H24",
            interfaceLanguage: language,
          });
        },
      );
      And("the legacy language key is gone", () =>
        expect(world.hasLegacyLanguage()).toBe(false),
      );
    },
  );

  // @add-interface-language-selection @FR8
  f.Scenario("Legacy key without a document", ({ Given, And, When, Then }) => {
    Given(
      "no preferences document is stored and the legacy language key holds {string}",
      (_ctx, language: string) => world.storeLegacyLanguage(language),
    );
    And("the browser language is {string}", (_ctx, language: string) =>
      world.setBrowserLanguage(language),
    );
    When("the app is opened again", world.reopenApp);
    Then("the main page is in Russian from its first render", () =>
      expectMainHeadingInRussian(),
    );
    And("no preferences document is stored", () =>
      expect(world.hasStoredPreferences()).toBe(false),
    );
  });

  // @add-interface-language-selection @FR7
  f.Scenario(
    "A chosen code that is no longer registered",
    ({ Given, And, When, Then }) => {
      Given(
        "the chosen interface language is {string}, which no locale file has",
        (_ctx, code: string) => world.storeChosenLanguage(code),
      );
      And("the browser language is {string}", (_ctx, language: string) =>
        world.setBrowserLanguage(language),
      );
      When("the app is opened again", world.reopenApp);
      Then("the main page is in Russian from its first render", () =>
        expectMainHeadingInRussian(),
      );
      And("nothing is written to the preferences document", () => {
        expect(world.storedPreferencesPayload()).toMatchObject({
          interfaceLanguage: "xx",
        });
      });
    },
  );

  // @add-interface-language-selection @FR12
  f.Scenario(
    "Reset returns to the browser language",
    ({ Given, And, When, Then }) => {
      Given("the browser language is {string}", (_ctx, language: string) =>
        world.setBrowserLanguage(language),
      );
      And("the stored preferences document is not valid JSON", () =>
        world.storeCorruptedPreferences(),
      );
      And("the user chose «Русский» in the language group", async () => {
        world.openApp();
        await world.openSettings();
        await world.chooseLanguage("Русский");
      });
      When("the user resets", () => world.resetSettings());
      Then("the interface language is English at once", () => {
        expect(i18n.language).toBe("en");
        expect(
          screen.getByRole("heading", { name: "Settings" }),
        ).toBeInTheDocument();
      });
    },
  );

  // @add-interface-language-selection @FR12
  f.Scenario("Language without storage", ({ Given, When, Then, And }) => {
    Given("storage is unavailable", world.makeStorageUnavailable);
    When("the user chooses «Русский» in the language group", async () => {
      world.openApp();
      await world.openSettings();
      await world.chooseLanguage("Русский");
      await world.flushWrites();
    });
    Then("the interface is in Russian", () =>
      expect(
        screen.getByRole("heading", { name: RUSSIAN_SETTINGS_HEADING }),
      ).toBeInTheDocument(),
    );
    And("the settings page says changes will not be saved", () =>
      expect(
        screen.getByText(i18n.t("settings.saveFailed")),
      ).toBeInTheDocument(),
    );
  });

  // @add-interface-language-selection @FR12
  f.Scenario("Another tab changes the language", ({ Given, When, Then }) => {
    Given("the app is open in two tabs in English", () => world.openApp());
    When("the user chooses «Русский» in the first tab", () =>
      world.saveFromAnotherTab("ru"),
    );
    Then("the second tab is in Russian without a reload", async () => {
      await waitFor(() => expectMainHeadingInRussian());
    });
  });
});
