// Verifies FR1–FR4, FR6, FR15 of add-day-colouring-setting.
import type { FeatureDescriibeCallbackParams } from "@amiceli/vitest-cucumber";
import { describeFeature, loadFeature } from "@amiceli/vitest-cucumber";
import { screen } from "@testing-library/react/pure";
import { expect, vi } from "vitest";
import { DayColour } from "@/presenter";
import { createDayColouringSettingsWorld } from "./dayColouringSettingsWorld";

vi.mock(
  "virtual:pwa-register/react",
  async () =>
    (await import("@/test/fakeServiceWorker")).fakeServiceWorkerModule,
);

const feature = await loadFeature("../settings_day_colouring_unit.feature");
const WORKING_HOURS_STORED = { dayColouring: "WORKING_HOURS" };

describeFeature(feature, (f: FeatureDescriibeCallbackParams) => {
  const world = createDayColouringSettingsWorld();

  f.BeforeEachScenario(async () => {
    await world.reset();
  });
  f.AfterAllScenarios(world.finish);

  const showSettings = () => {
    world.openTab();
  };
  const groupNames = () =>
    screen.getAllByRole("radiogroup").map((group) => {
      const captionId = group.getAttribute("aria-labelledby") ?? "";
      return document.getElementById(captionId)?.textContent;
    });

  // @add-day-colouring-setting @FR1 @FR2
  f.Scenario("Time of day by default", ({ Given, When, Then, And }) => {
    Given("no preferences are stored", () => localStorage.clear());
    When("the settings page is shown", showSettings);
    Then("the colouring group follows the view group", () => {
      const names = groupNames();
      expect(names.indexOf("Colouring")).toBe(names.indexOf("View") + 1);
    });
    And(
      "the colouring options are {string}, {string} and {string} in this order with {string} checked",
      (
        _ctx,
        plain: string,
        timeOfDay: string,
        working: string,
        checked: string,
      ) => {
        expect(world.optionNames()).toEqual([plain, timeOfDay, working]);
        expect(world.checkedOptionName()).toBe(checked);
      },
    );
  });

  // @add-day-colouring-setting @FR3
  f.Scenario(
    "Choosing a colouring applies at once",
    ({ Given, And, When, Then }) => {
      Given("the list contains {string}", (_ctx, city: string) =>
        world.setList(city),
      );
      And("the settings page is shown", showSettings);
      When("the user chooses the colouring {string}", (_ctx, name: string) =>
        world.chooseColouring(name),
      );
      Then("the Almaty track is plain", () => {
        expect(world.trackColours("Almaty")).toEqual([DayColour.PLAIN]);
      });
      And("the stored document is not rewritten before the debounce", () => {
        expect(world.storedText()).toBeNull();
      });
    },
  );

  // @add-day-colouring-setting @FR4 @FR6
  f.Scenario("The row follows the colouring", ({ Given, When, Then }) => {
    Given("the settings page is shown", showSettings);
    Then("there is no working hours row", () => {
      expect(world.workingHoursRow()).toBeNull();
    });
    When("the user chooses the colouring {string}", (_ctx, name: string) =>
      world.chooseColouring(name),
    );
    Then(
      "the working hours row shows {string} and {string} directly under the colouring group",
      (_ctx, start: string, end: string) => {
        expect(world.fieldTexts()).toEqual([start, end]);
        expect(world.workingHoursRow()?.previousElementSibling).toBe(
          world.colouringGroup(),
        );
      },
    );
    When("the user switches to the colouring {string}", (_ctx, name: string) =>
      world.chooseColouring(name),
    );
    Then("the working hours row is absent again", () => {
      expect(world.workingHoursRow()).toBeNull();
    });
  });

  // @add-day-colouring-setting @FR15
  f.ScenarioOutline(
    "Both languages of the colouring settings",
    ({ Given, And, When, Then }, variables) => {
      Given("the interface language is <language>", () =>
        world.setLanguage(variables.language).then(() => undefined),
      );
      And("the colouring {string} is stored", () =>
        world.storePayload(WORKING_HOURS_STORED),
      );
      When("the settings page is shown", showSettings);
      Then(
        "the colouring group is <colouring> with the options <plain>, <time of day> and <working>",
        () => {
          expect(world.colouringGroup()).toHaveAccessibleName(
            variables.colouring,
          );
          expect(world.optionNames()).toEqual([
            variables.plain,
            variables["time of day"],
            variables.working,
          ]);
        },
      );
      And(
        "the working hours row is <row> with the fields <start> and <end>",
        () => {
          expect(world.workingHoursRow()).toHaveAccessibleName(variables.row);
          expect(
            screen.getByRole("textbox", { name: variables.start }),
          ).toBeVisible();
          expect(
            screen.getByRole("textbox", { name: variables.end }),
          ).toBeVisible();
        },
      );
    },
  );
});
