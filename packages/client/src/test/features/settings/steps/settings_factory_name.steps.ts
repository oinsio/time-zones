// Verifies FR2, UX1 of keep-gnomish-factory-name-untranslated-in-credit (D2).
import type { FeatureDescriibeCallbackParams } from "@amiceli/vitest-cucumber";
import { describeFeature, loadFeature } from "@amiceli/vitest-cucumber";
import i18n from "i18next";
import { expect } from "vitest";
import { SUPPORTED_LANGUAGES } from "@/i18n";

const feature = await loadFeature("../settings_factory_name.feature");

describeFeature(feature, (f: FeatureDescriibeCallbackParams) => {
  let credits: { language: string; creditText: string }[] = [];

  // @keep-gnomish-factory-name-untranslated-in-credit @FR2 @UX1
  f.Scenario(
    "The factory name in every supported interface language",
    ({ When, Then }) => {
      When(
        "the Gnomish Factory credit is read in every supported interface language",
        () => {
          credits = SUPPORTED_LANGUAGES.map((language) => ({
            language,
            creditText: i18n.getFixedT(language)(
              "settings.gnomishFactoryCredit",
            ),
          }));
        },
      );
      Then(
        "every credit contains the factory name {string}",
        (_ctx: unknown, factoryName: string) => {
          expect(credits).toHaveLength(SUPPORTED_LANGUAGES.length);
          for (const { language, creditText } of credits) {
            expect(creditText, language).toContain(factoryName);
          }
        },
      );
    },
  );
});
