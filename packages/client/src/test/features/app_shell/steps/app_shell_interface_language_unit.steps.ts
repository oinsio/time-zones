// Verifies FR7, FR10 of add-interface-language-selection.

import zoneCities from "virtual:zone-cities";
import type { FeatureDescriibeCallbackParams } from "@amiceli/vitest-cucumber";
import { describeFeature, loadFeature } from "@amiceli/vitest-cucumber";
import i18next from "i18next";
import { expect } from "vitest";
import { createCompositeCitySearch } from "@/adapters/city-search";
import { FIRST_DAY_OF_WEEK_BY_LANGUAGE } from "@/constants";
import { createI18nOptions } from "@/i18n";
import {
  pickByLanguageFallback,
  type RegisteredLocale,
  resolveCityNameLanguage,
  resolveInterfaceLanguage,
} from "@/locales";
import { DIALECT_REGISTRY } from "@/test/factories/localeFixtures";

const feature = await loadFeature(
  "../app_shell_interface_language_unit.feature",
);

const MONDAY = 1;

const splitList = (text: string) => text.split(",").map((part) => part.trim());

describeFeature(feature, (f: FeatureDescriibeCallbackParams) => {
  let chosenLanguage: string | null = null;
  let resolvedLanguage = "";
  let translationsByCode: Record<string, Record<string, string>> = {};
  let dialectRegistry: readonly RegisteredLocale[] = [];

  f.BeforeEachScenario(() => {
    chosenLanguage = null;
    resolvedLanguage = "";
    translationsByCode = {};
    dialectRegistry = [];
  });

  // @add-interface-language-selection @FR7
  f.ScenarioOutline(
    "Browser language decides without a choice",
    ({ Given, When, Then }, variables) => {
      Given("no interface language is chosen", () => {
        chosenLanguage = null;
      });
      When('the app starts with the browser languages "<browser>"', () => {
        resolvedLanguage = resolveInterfaceLanguage(
          chosenLanguage,
          splitList(String(variables.browser)),
        );
      });
      Then('the interface language is "<language>"', () => {
        expect(resolvedLanguage).toBe(String(variables.language));
      });
    },
  );

  // @add-interface-language-selection @FR7
  f.Scenario(
    "A chosen language wins over the browser",
    ({ Given, When, Then }) => {
      Given('the chosen interface language is "ru"', () => {
        chosenLanguage = "ru";
      });
      When('the app starts with the browser languages "en-US"', () => {
        resolvedLanguage = resolveInterfaceLanguage(chosenLanguage, ["en-US"]);
      });
      Then('the interface language is "ru"', () => {
        expect(resolvedLanguage).toBe("ru");
      });
    },
  );

  // @add-interface-language-selection @FR7 @FR10
  f.Scenario(
    "A dialect is not picked by its base language",
    ({ Given, When, Then }) => {
      Given(
        'the registry has "ru" and a dialect "ru-KZ" with base language "ru"',
        () => {
          dialectRegistry = DIALECT_REGISTRY;
        },
      );
      When('the app starts with the browser languages "ru-RU"', () => {
        resolvedLanguage = resolveInterfaceLanguage(
          null,
          ["ru-RU"],
          dialectRegistry,
        );
      });
      Then('the interface language is "ru"', () => {
        expect(resolvedLanguage).toBe("ru");
      });
    },
  );

  // @add-interface-language-selection @FR10
  f.Scenario("Fallback order of a dialect", ({ Given, And, When, Then }) => {
    const translate = (code: string, key: string) => {
      translationsByCode[code] = { ...translationsByCode[code], [key]: code };
    };
    Given('a dialect "ru-KZ" with base language "ru"', () => {
      dialectRegistry = DIALECT_REGISTRY;
    });
    And('the key "a" is translated in "ru-KZ", "ru" and "en"', () => {
      for (const code of ["ru-KZ", "ru", "en"]) translate(code, "a");
    });
    And('the key "b" is translated in "ru" and "en" only', () => {
      for (const code of ["ru", "en"]) translate(code, "b");
    });
    And('the key "c" is translated in "en" only', () => {
      translate("en", "c");
    });
    When('the interface language is "ru-KZ"', async () => {
      const withTranslations = dialectRegistry.map((locale) => ({
        ...locale,
        translations: translationsByCode[locale.metadata.code] ?? {},
      }));
      const instance = i18next.createInstance();
      await instance.init({
        ...createI18nOptions(withTranslations),
        lng: "ru-KZ",
      });
      resolvedLanguage = ["a", "b", "c"]
        .map((key) => instance.t(key))
        .join(" ");
    });
    Then(
      '"a" shows the "ru-KZ" text, "b" the "ru" text and "c" the "en" text',
      () => {
        expect(resolvedLanguage).toBe("ru-KZ ru en");
      },
    );
  });

  // @add-interface-language-selection @FR10
  f.Scenario(
    "Language-keyed data of a dialect",
    ({ Given, When, Then, And }) => {
      let cityName = "";
      let firstDayOfWeek: number | undefined;
      Given('a dialect "ru-KZ" with base language "ru"', () => {
        dialectRegistry = DIALECT_REGISTRY;
      });
      When('the interface language is "ru-KZ"', () => {
        const citySearch = createCompositeCitySearch(zoneCities);
        cityName = citySearch.getExemplarCity(
          "Asia/Almaty",
          resolveCityNameLanguage("ru-KZ", dialectRegistry),
        );
        firstDayOfWeek = pickByLanguageFallback(
          "ru-KZ",
          FIRST_DAY_OF_WEEK_BY_LANGUAGE,
          dialectRegistry,
        );
      });
      Then('the city of "Asia/Almaty" is named "Алматы"', () => {
        expect(cityName).toBe("Алматы");
      });
      And("calendar weeks start on Monday", () => {
        expect(firstDayOfWeek).toBe(MONDAY);
      });
    },
  );
});
