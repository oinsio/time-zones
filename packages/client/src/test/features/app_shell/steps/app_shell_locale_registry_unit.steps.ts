// Verifies FR9, FR11 of add-interface-language-selection.

import type { FeatureDescriibeCallbackParams } from "@amiceli/vitest-cucumber";
import { describeFeature, loadFeature } from "@amiceli/vitest-cucumber";
import { expect } from "vitest";
import { createI18nOptions } from "@/i18n";
import {
  buildLocaleRegistry,
  findRegisteredLocale,
  localeRegistry,
  type RegisteredLocale,
} from "@/locales";

const feature = await loadFeature("../app_shell_locale_registry_unit.feature");

const ENGLISH = "en";
const AMERICAN_FLAG = "🇺🇸";

const metadataOf = (code: string, name: string) => ({
  code,
  name,
  nativeName: name,
  baseLanguage: code,
  emoji: "🏳️",
});

const localeFileOf = (code: string, name: string) => ({
  _meta: metadataOf(code, name),
  greeting: code,
});

const NAMES: Record<string, string> = {
  en: "English",
  ru: "Russian",
  de: "German",
};

/** The defect of a rejected file, applied to complete metadata. */
const brokenMetadata = (file: string, defect: string) => {
  const metadata: Record<string, unknown> = metadataOf(file, file);
  if (defect === "has no nativeName") delete metadata.nativeName;
  if (defect === "has an empty emoji") metadata.emoji = "";
  if (defect === "has the code pt") metadata.code = "pt";
  return metadata;
};


describeFeature(feature, (f: FeatureDescriibeCallbackParams) => {
  let registry: readonly RegisteredLocale[] = [];
  let modules: Record<string, unknown> = {};
  let _chosenLanguage: string | null = null;
  let _resolvedLanguage = "";
  let _translationsByCode: Record<string, Record<string, string>> = {};
  let _dialectRegistry: readonly RegisteredLocale[] = [];

  f.BeforeEachScenario(() => {
    registry = [];
    modules = {};
    _chosenLanguage = null;
    _resolvedLanguage = "";
    _translationsByCode = {};
    _dialectRegistry = [];
  });

  // @add-interface-language-selection @FR9
  f.Scenario("Registry from locale files", ({ Given, When, Then }) => {
    Given('locale files "en", "ru" and "de" with complete metadata', () => {
      modules = Object.fromEntries(
        Object.entries(NAMES).map(([code, name]) => [
          `./${code}.json`,
          localeFileOf(code, name),
        ]),
      );
    });
    When("the registry is built", () => {
      registry = buildLocaleRegistry(modules);
    });
    Then('it lists "en", "de" and "ru" in this order', () => {
      expect(registry.map(({ metadata }) => metadata.code)).toEqual([
        "en",
        "de",
        "ru",
      ]);
    });
  });

  // @add-interface-language-selection @FR9
  f.ScenarioOutline(
    "Rejected locale files",
    ({ Given, When, Then }, variables) => {
      Given('a locale file "<file>" whose metadata "<defect>"', () => {
        const file = String(variables.file);
        modules = {
          [`./${file}.json`]: {
            _meta: brokenMetadata(file, String(variables.defect)),
          },
        };
      });
      When("the registry is built", () => {
        registry = buildLocaleRegistry(modules);
      });
      Then('the registry does not contain "<file>"', () => {
        expect(findRegisteredLocale(String(variables.file), registry)).toBe(
          undefined,
        );
      });
    },
  );

  // @add-interface-language-selection @FR9
  f.Scenario("Metadata is not a translation", ({ When, Then }) => {
    let translations: Record<string, unknown> = {};
    When("the registry gives the English translations to the interface", () => {
      translations = (createI18nOptions(localeRegistry).resources?.[ENGLISH]
        ?.translation ?? {}) as Record<string, unknown>;
    });
    Then('they contain no "_meta" key', () => {
      expect(translations).not.toHaveProperty("_meta");
    });
  });

  // @add-interface-language-selection @FR11
  f.Scenario("American flag for English", ({ When, Then }) => {
    let emoji = "";
    When("the English locale file is read", () => {
      emoji = findRegisteredLocale(ENGLISH)?.metadata.emoji ?? "";
    });
    Then('its metadata emoji is "🇺🇸"', () => {
      expect(emoji).toBe(AMERICAN_FLAG);
    });
  });
});
