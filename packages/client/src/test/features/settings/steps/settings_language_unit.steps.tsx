// Verifies FR5, FR7, FR8, FR12, UX3 of add-interface-language-selection.
import type { FeatureDescriibeCallbackParams } from "@amiceli/vitest-cucumber";
import { describeFeature, loadFeature } from "@amiceli/vitest-cucumber";
import { screen } from "@testing-library/react/pure";
import userEvent from "@testing-library/user-event";
import i18n from "i18next";
import { expect, vi } from "vitest";
import { Temporal } from "@/lib/temporal";
import { formatLocalDate } from "@/presenter";
import { createSettingsLanguageWorld } from "./settingsLanguageWorld";

vi.mock(
  "virtual:pwa-register/react",
  async () =>
    (await import("@/test/fakeServiceWorker")).fakeServiceWorkerModule,
);

const feature = await loadFeature("../settings_language_unit.feature");

const RUSSIAN_MAIN_HEADING = "Часовые пояса";
const RUSSIAN_SETTINGS_HEADING = "Настройки";
const FLAG_TEXT_ENGLISH = "🇺🇸English";
const FLAG_TEXT_RUSSIAN = "🇷🇺Русский";
const ALMATY_ZONE_ID = "Asia/Almaty";

describeFeature(feature, (f: FeatureDescriibeCallbackParams) => {
  const world = createSettingsLanguageWorld();
  let instant = "";
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
      And("the current instant is {string}", (_ctx, isoInstant: string) => {
        instant = isoInstant;
        world.setInstant(isoInstant);
      });
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
        "after going back Almaty reads «Алматы» and shows the country «Казахстан»",
        async () => {
          await world.goBack();
          expect(await screen.findByText("Алматы")).toBeInTheDocument();
          expect(await screen.findByText(/Казахстан/)).toBeInTheDocument();
          expect(document.documentElement.lang).toBe("ru");
        },
      );
      And("the date shows the Russian weekday", () => {
        const russianDate = formatLocalDate(
          Temporal.Instant.from(instant).toZonedDateTimeISO(ALMATY_ZONE_ID),
          "ru",
        );
        expect(screen.getAllByText(russianDate).length).toBeGreaterThan(0);
      });
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
});
