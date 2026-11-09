// Verifies FR2, FR3, FR4 of add-view-mode-setting-and-grid-skeleton.
import type { FeatureDescriibeCallbackParams } from "@amiceli/vitest-cucumber";
import { describeFeature, loadFeature } from "@amiceli/vitest-cucumber";
import { screen, waitFor } from "@testing-library/react/pure";
import i18n from "i18next";
import { expect, vi } from "vitest";
import { PREFERENCES_SCHEMA_VERSION } from "@/constants";
import { resolveStartInterfaceLanguage } from "@/i18n";
import { ViewId } from "@/views";
import { createViewModeWorld } from "./viewModeWorld";

vi.mock("@/views", async (importOriginal) =>
  (await import("@/test/registryOverride")).withRegistryOverride(
    await importOriginal<typeof import("@/views")>(),
  ),
);

const VERSION_BEFORE_VIEW_MODE = 3;
const WRONG_TYPE_VIEW_MODE = 42;
const UNREGISTERED_VIEW_ID = "timeline";

const feature = await loadFeature("../settings_view_mode_unit.feature");

describeFeature(feature, (f: FeatureDescriibeCallbackParams) => {
  const world = createViewModeWorld();
  const viewCaption = () => i18n.t("settings.viewModeLabel");

  f.BeforeEachScenario(world.reset);
  f.AfterAllScenarios(world.finish);

  // @add-view-mode-setting-and-grid-skeleton @FR2 @FR3
  f.Scenario("Cards by default", ({ Given, When, Then, And }) => {
    Given("no preferences document is stored", () => {
      expect(world.storedDocument()).toBeNull();
    });
    When("the user opens the app and the settings page", () => {
      world.openTab();
    });
    Then("the main page showed the Cards view", async () => {
      expect(await world.shownViewId()).toBe(ViewId.CARDS);
    });
    And(
      "the view group has the options {string} and {string}, in this order, with {string} checked",
      (_ctx, first: string, second: string, checked: string) => {
        expect(world.optionNames()).toEqual([first, second]);
        expect(world.checkedOptionOf(viewCaption())).toBe(checked);
      },
    );
  });

  // @add-view-mode-setting-and-grid-skeleton @FR4
  f.Scenario("Choosing Grid", ({ Given, When, Then }) => {
    Given("the stored locations are Almaty and Moscow", () => {
      world.setList("Almaty", "Moscow");
    });
    When("the user chooses the view {string}", async (_ctx, name: string) => {
      world.openTab();
      await world.shownViewId();
      await world.chooseView(name);
    });
    Then(
      "the main page shows the Grid view with Almaty and Moscow",
      async () => {
        await waitFor(async () =>
          expect(await world.shownViewId()).toBe(ViewId.GRID),
        );
        expect(world.rowNames()).toEqual([
          i18n.t("locations.locationMenu", { city: "Almaty" }),
          i18n.t("locations.locationMenu", { city: "Moscow" }),
        ]);
      },
    );
  });

  // @add-view-mode-setting-and-grid-skeleton @FR3 @FR4
  f.Scenario(
    "A stored view that is not registered",
    ({ Given, When, Then, And }) => {
      Given(
        "the stored preferences hold the view mode {string}, which no registered view has",
        (_ctx, viewMode: string) => {
          expect(viewMode).toBe(UNREGISTERED_VIEW_ID);
          world.storeViewMode(viewMode);
        },
      );
      When("the app is opened", () => {
        world.openTab();
      });
      Then("the main page shows the Cards view", async () => {
        expect(await world.shownViewId()).toBe(ViewId.CARDS);
      });
      And("the view group checks {string}", (_ctx, name: string) => {
        expect(world.checkedOptionOf(viewCaption())).toBe(name);
      });
    },
  );

  // @add-view-mode-setting-and-grid-skeleton @FR2
  f.Scenario(
    "A newly registered view appears in the settings",
    ({ Given, When, Then }) => {
      Given(
        "a test view titled {string} is added to the registry after Grid",
        world.addSampleView,
      );
      When("the settings page is shown", () => {
        world.openTab();
      });
      Then(
        "the view group has the options {string}, {string} and {string}, in this order",
        (_ctx, first: string, second: string, third: string) => {
          expect(world.optionNames()).toEqual([first, second, third]);
        },
      );
    },
  );

  // @add-view-mode-setting-and-grid-skeleton @FR4
  f.Scenario("The view survives a reload", ({ Given, When, Then, And }) => {
    Given("the user chose the view {string}", async (_ctx, name: string) => {
      world.openTab();
      await world.chooseView(name);
      world.runPendingWrite();
      world.closeTabs();
    });
    When("the app is opened again", () => {
      world.openTab();
    });
    Then(
      "the main page shows the Grid view from its first render",
      async () => {
        expect(await world.shownViewId()).toBe(ViewId.GRID);
      },
    );
    And("the view group checks {string}", (_ctx, name: string) => {
      expect(world.checkedOptionOf(viewCaption())).toBe(name);
    });
  });

  // @add-view-mode-setting-and-grid-skeleton @FR3 @FR4
  f.Scenario("Existing users get Cards", ({ Given, When, Then, And }) => {
    Given(
      "the stored preferences document was written before the view mode existed, with the theme Dark, the hour format 12-hour, the language {string} and only the UTC offset in the zone label",
      (_ctx, language: string) => {
        world.storePreferences(VERSION_BEFORE_VIEW_MODE, {
          theme: "DARK",
          hourFormat: "H12",
          interfaceLanguage: language,
          zoneLabelParts: ["UTC_OFFSET"],
        });
      },
    );
    When("the app is opened", async () => {
      await i18n.changeLanguage(resolveStartInterfaceLanguage());
      world.openTab();
    });
    Then(
      "the main page shows the Cards view and the view group checks {string}",
      async (_ctx, name: string) => {
        expect(await world.shownViewId()).toBe(ViewId.CARDS);
        expect(world.checkedOptionOf(viewCaption())).toBe(name);
      },
    );
    And(
      "the theme Dark, the hour format 12-hour, the language {string} and the zone label with only the UTC offset are in force",
      (_ctx, languageName: string) => {
        expect(world.checkedOptionOf(i18n.t("settings.themeLabel"))).toBe(
          i18n.t("settings.themeDark"),
        );
        expect(world.checkedOptionOf(i18n.t("settings.hourFormatLabel"))).toBe(
          i18n.t("settings.hourFormat12"),
        );
        expect(
          screen.getByRole("button", {
            name: i18n.t("settings.languageButton", { language: languageName }),
          }),
        ).toBeInTheDocument();
        expect(
          world.pressedTogglesOf(i18n.t("settings.zoneLabelLabel")),
        ).toEqual([i18n.t("settings.zoneLabelUtcOffset")]);
      },
    );
    And(
      "the stored document is not rewritten until the user changes a setting",
      () => {
        expect(JSON.parse(world.storedDocument() ?? "{}").schemaVersion).toBe(
          VERSION_BEFORE_VIEW_MODE,
        );
      },
    );
  });

  // @add-view-mode-setting-and-grid-skeleton @FR4
  f.Scenario("Another tab changes the view", ({ Given, When, Then }) => {
    Given("the app is open in two tabs, both showing Cards", async () => {
      world.givenTwoTabs();
      const [first, second] = [world.openTab(), world.openTab()];
      expect(await world.shownViewId(first)).toBe(ViewId.CARDS);
      expect(await world.shownViewId(second)).toBe(ViewId.CARDS);
    });
    When(
      "the user chooses the view {string} in the first tab",
      async (_ctx, name: string) => {
        const [firstTab] = world.openedTabs();
        await world.chooseView(name, firstTab);
        world.runPendingWrite(firstTab);
      },
    );
    Then("the second tab shows the Grid view without a reload", async () => {
      const [, secondTab] = world.openedTabs();
      await waitFor(async () =>
        expect(await world.shownViewId(secondTab)).toBe(ViewId.GRID),
      );
    });
  });

  // @add-view-mode-setting-and-grid-skeleton @FR3
  f.Scenario("A view mode of the wrong type", ({ Given, When, Then, And }) => {
    Given(
      "the stored preferences document of the current version holds the view mode {int} as a number",
      (_ctx, viewMode: number) => {
        expect(viewMode).toBe(WRONG_TYPE_VIEW_MODE);
        expect(PREFERENCES_SCHEMA_VERSION).toBeGreaterThan(
          VERSION_BEFORE_VIEW_MODE,
        );
        world.storeViewMode(viewMode);
      },
    );
    When("the user opens the app and the settings page", () => {
      world.openTab();
    });
    Then("the main page was shown with the Cards view", async () => {
      expect(await world.shownViewId()).toBe(ViewId.CARDS);
    });
    And("the settings page shows the note with a Reset action", () => {
      expect(world.hasNoteWithReset()).toBe(true);
    });
  });
});
