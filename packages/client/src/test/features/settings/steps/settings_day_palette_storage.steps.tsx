// Verifies FR3 of redesign-cards-grid-and-day-palettes.
import type { FeatureDescriibeCallbackParams } from "@amiceli/vitest-cucumber";
import { describeFeature, loadFeature } from "@amiceli/vitest-cucumber";
import { expect, vi } from "vitest";
import { createDayColouringSettingsWorld } from "./dayColouringSettingsWorld";

vi.mock(
  "virtual:pwa-register/react",
  async () =>
    (await import("@/test/fakeServiceWorker")).fakeServiceWorkerModule,
);

const feature = await loadFeature("../settings_day_palette_storage.feature");
/** The schema version before the day palette existed. */
const SCHEMA_VERSION_BEFORE_DAY_PALETTE = 6;

describeFeature(feature, (f: FeatureDescriibeCallbackParams) => {
  const world = createDayColouringSettingsWorld();

  f.BeforeEachScenario(world.reset);
  f.AfterAllScenarios(world.finish);

  const reopen = () => {
    world.closeTabs();
    world.openTab();
  };
  const chooseInFirstTab = async (name: string) => {
    await world.choosePalette(name, world.tabs()[0]);
    world.runPendingWrite(world.tabs()[0]);
  };

  // @redesign-cards-grid-and-day-palettes @FR3
  f.Scenario("The palette survives a reload", ({ Given, When, Then }) => {
    Given(
      "the user chose the day palette {string}",
      async (_ctx, name: string) => {
        world.openTab();
        await chooseInFirstTab(name);
      },
    );
    When("the app is opened again", reopen);
    Then("the day palette {string} is checked", (_ctx, name: string) =>
      expect(world.checkedPaletteName()).toBe(name),
    );
  });

  // @redesign-cards-grid-and-day-palettes @FR3
  f.Scenario("Existing users get Vivid", ({ Given, When, Then }) => {
    Given(
      "a stored preferences document of the previous version with the theme {string} and the colouring {string}",
      (_ctx, theme: string, colouring: string) =>
        world.storeDocument(SCHEMA_VERSION_BEFORE_DAY_PALETTE, {
          theme,
          hourFormat: "H24",
          interfaceLanguage: null,
          viewMode: null,
          zoneLabelParts: ["UTC_OFFSET"],
          dayColouring: colouring,
          workingHours: { start: "10:00", end: "18:00" },
        }),
    );
    When("the app is opened again", reopen);
    Then(
      "the stored day palette is {string}, the theme {string} and the colouring {string}",
      (_ctx, palette: string, theme: string, colouring: string) =>
        expect(world.loadStoredPreferences()).toMatchObject({
          dayPalette: palette,
          theme,
          dayColouring: colouring,
        }),
    );
  });

  // @redesign-cards-grid-and-day-palettes @FR3
  f.Scenario("Unknown palette is unreadable", ({ Given, When, Then }) => {
    Given(
      "a stored preferences document of the current version whose day palette is {string}",
      (_ctx, palette: string) => world.storePayload({ dayPalette: palette }),
    );
    When("the app is opened again", reopen);
    Then("the settings page shows the unreadable note", () =>
      expect(world.hasUnreadableNote()).toBe(true),
    );
  });

  // @redesign-cards-grid-and-day-palettes @FR3
  f.Scenario("Another tab changes the palette", ({ Given, When, Then }) => {
    Given("the app is open in two tabs", () => {
      world.givenTwoTabs();
      world.openTab();
      world.openTab();
    });
    When(
      "the user chooses the day palette {string} in the first tab",
      (_ctx, name: string) => chooseInFirstTab(name),
    );
    Then(
      "the second tab has the day palette {string} checked without a reload",
      (_ctx, name: string) =>
        expect(world.checkedPaletteName(world.tabs()[1])).toBe(name),
    );
  });

  // @redesign-cards-grid-and-day-palettes @FR3
  f.Scenario(
    "The palette survives a colouring change",
    ({ Given, When, And, Then }) => {
      Given(
        "the user chose the day palette {string}",
        async (_ctx, name: string) => {
          world.openTab();
          await chooseInFirstTab(name);
        },
      );
      When("the user chooses the colouring {string}", (_ctx, name: string) =>
        world.chooseColouring(name),
      );
      And("the user chooses the colouring {string}", (_ctx, name: string) =>
        world.chooseColouring(name),
      );
      Then("the day palette {string} is checked", (_ctx, name: string) =>
        expect(world.checkedPaletteName()).toBe(name),
      );
    },
  );
});
