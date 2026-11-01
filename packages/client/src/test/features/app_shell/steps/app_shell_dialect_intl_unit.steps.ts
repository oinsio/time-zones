// Verifies FR5, M4 of show-city-labels-in-interface-language (D5).
import type { FeatureDescriibeCallbackParams } from "@amiceli/vitest-cucumber";
import { describeFeature, loadFeature } from "@amiceli/vitest-cucumber";
import i18n from "i18next";
import { beforeAll, expect, vi } from "vitest";
import { fakeClock, Temporal } from "@/lib/temporal";
import { SearchMatchKind } from "@/ports";
import { HourFormat } from "@/preferences";

const DIALECT_CODE = "tlh";
const BASE_CODE = "ru";

// Only this file sees the extra locale: the registry data is replaced here.
vi.mock("@/locales/localeRegistry", async (importOriginal) => {
  const original =
    await importOriginal<typeof import("@/locales/localeRegistry")>();
  const { buildRegisteredLocale } = await import(
    "@/test/factories/localeFixtures"
  );
  return {
    ...original,
    localeRegistry: [
      ...original.localeRegistry,
      buildRegisteredLocale("tlh", "Klingon", "tlhIngan Hol", "ru"),
    ],
  };
});

const feature = await loadFeature("../app_shell_dialect_intl_unit.feature");

describeFeature(feature, (f: FeatureDescriibeCallbackParams) => {
  let presentSearchResults: typeof import("@/presenter").presentSearchResults;
  let formatLocalDate: typeof import("@/presenter").formatLocalDate;
  let presentDateBar: typeof import("@/presenter").presentDateBar;
  let language = BASE_CODE;

  // The setup files load the real registry first, so the presenter loads anew under the mock.
  beforeAll(async () => {
    vi.resetModules();
    ({ presentSearchResults, formatLocalDate, presentDateBar } = await import(
      "@/presenter"
    ));
  });

  const zonedDateTime = fakeClock("2026-03-08T07:30:00Z")
    .instant()
    .toZonedDateTimeISO("Asia/Almaty");
  const date = Temporal.PlainDate.from("2026-03-08");
  const presentBar = (code: string) =>
    presentDateBar({
      effectiveDate: date,
      today: date,
      isPinned: false,
      gap: undefined,
      language: code,
      hourFormat: HourFormat.H24,
      translate: i18n.getFixedT(code),
    });

  // @show-city-labels-in-interface-language @FR5
  f.Scenario(
    "Intl data of a dialect Intl does not know",
    ({ Given, And, When, Then }) => {
      Given(
        'a dialect "tlh" with base language "ru", a code Intl supports no data for',
        () => {
          expect(
            Intl.DateTimeFormat.supportedLocalesOf([DIALECT_CODE]),
          ).toEqual([]);
        },
      );
      And("the device's own locale is English", () => {
        expect(new Intl.DateTimeFormat().resolvedOptions().locale).toMatch(
          /^en/,
        );
      });
      When('the interface language is "tlh"', () => {
        language = DIALECT_CODE;
      });
      Then(
        "the country of {string} is named {string}",
        (_ctx, countryCode: string, countryName: string) => {
          const [result] = presentSearchResults(
            [
              {
                record: {
                  id: "Asia/Almaty",
                  timeZoneId: "Asia/Almaty",
                  names: { en: "Almaty", ru: "Алматы" },
                  countryCode,
                  aliases: [],
                  rank: 1,
                },
                matchKind: SearchMatchKind.CITY_PREFIX,
              },
            ],
            [],
            { language, cityNameLanguage: "ru" },
          );
          expect(result?.countryName).toBe(countryName);
        },
      );
      And(
        "the local date of a row and the date bar weekday equal their Russian texts",
        () => {
          expect(formatLocalDate(zonedDateTime, language)).toBe(
            formatLocalDate(zonedDateTime, BASE_CODE),
          );
          expect(presentBar(language).longLabel).toBe(
            presentBar(BASE_CODE).longLabel,
          );
        },
      );
    },
  );
});
