// Verifies FR5, UX2 of redesign-cards-grid-and-day-palettes.
import type { FeatureDescriibeCallbackParams } from "@amiceli/vitest-cucumber";
import { describeFeature, loadFeature } from "@amiceli/vitest-cucumber";
import i18n from "i18next";
import { expect, vi } from "vitest";
import { localeRegistry } from "@/locales";
import { createDayColouringSettingsWorld } from "./dayColouringSettingsWorld";

vi.mock(
  "virtual:pwa-register/react",
  async () =>
    (await import("@/test/fakeServiceWorker")).fakeServiceWorkerModule,
);

const feature = await loadFeature("../settings_day_palette_unit.feature");
const COLOURING_VALUES: Record<string, string> = {
  Plain: "PLAIN",
  "Time of day": "TIME_OF_DAY",
  "Working hours": "WORKING_HOURS",
};
const PALETTE_KEYS = [
  "dayPaletteLabel",
  "dayPaletteVivid",
  "dayPaletteMuted",
] as const;

describeFeature(feature, (f: FeatureDescriibeCallbackParams) => {
  const world = createDayColouringSettingsWorld();

  f.BeforeEachScenario(world.reset);
  f.AfterAllScenarios(world.finish);

  const showSettings = () => {
    world.openTab();
  };

  // @redesign-cards-grid-and-day-palettes @FR5 @UX2
  f.ScenarioOutline(
    "Shown only in the Time of day colouring",
    ({ Given, When, Then }, variables) => {
      Given("the stored colouring is {string}", () =>
        world.storePayload({
          dayColouring: COLOURING_VALUES[variables.colouring],
        }),
      );
      When("the settings page is shown", showSettings);
      Then("the Colours group is <visibility>", () =>
        expect(world.paletteGroup() !== null).toBe(
          variables.visibility === "shown",
        ),
      );
    },
  );

  // @redesign-cards-grid-and-day-palettes @FR5
  f.Scenario("Vivid is checked by default", ({ When, Then }) => {
    When("the settings page is shown", showSettings);
    Then(
      "the Colours group offers {string} and {string} with {string} checked",
      (_ctx, vivid: string, muted: string, checked: string) => {
        expect(world.paletteOptionNames()).toEqual([vivid, muted]);
        expect(world.checkedPaletteName()).toBe(checked);
      },
    );
  });

  // @redesign-cards-grid-and-day-palettes @FR5 @UX2
  f.ScenarioOutline(
    "Both languages of the Colours group",
    ({ Given, When, Then }, variables) => {
      Given("the interface language is {string}", async () => {
        await world.setLanguage(variables.language);
      });
      When("the settings page is shown", showSettings);
      Then(
        "the Colours group is named {string} and offers {string} and {string}",
        () => {
          expect(world.paletteGroup()).toHaveAccessibleName(variables.caption);
          expect(world.paletteOptionNames()).toEqual([
            variables.vivid,
            variables.muted,
          ]);
        },
      );
    },
  );

  // @redesign-cards-grid-and-day-palettes @FR5
  f.Scenario("Every locale has the keys", ({ Then }) => {
    Then("every locale has the keys of the Colours group", () => {
      for (const { translations } of localeRegistry) {
        for (const key of PALETTE_KEYS) {
          expect(
            (translations as { settings: Record<string, string> }).settings[
              key
            ],
          ).toBeTruthy();
        }
      }
      expect(i18n.exists("settings.dayPaletteLabel")).toBe(true);
    });
  });
});
