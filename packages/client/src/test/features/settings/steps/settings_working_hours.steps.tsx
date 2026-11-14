// Verifies FR5, FR6, FR7 of add-day-colouring-setting.
import type { FeatureDescriibeCallbackParams } from "@amiceli/vitest-cucumber";
import { describeFeature, loadFeature } from "@amiceli/vitest-cucumber";
import { expect, vi } from "vitest";
import { createDayColouringSettingsWorld } from "./dayColouringSettingsWorld";

vi.mock(
  "virtual:pwa-register/react",
  async () =>
    (await import("@/test/fakeServiceWorker")).fakeServiceWorkerModule,
);

const feature = await loadFeature("../settings_working_hours.feature");
const START_LABEL_KEY = "settings.workingHoursStartLabel";
const END_LABEL_KEY = "settings.workingHoursEndLabel";
const CONFIRM_KEY = "{Enter}";
const ESCAPE_KEY = "{Escape}";
const WORKING_HOURS_STORED = { dayColouring: "WORKING_HOURS" };
const DEFAULT_HOURS = { start: "10:00", end: "18:00" };

const unquote = (text: string) => text.split('"').join("");
const parseHours = (text: string) => {
  const [start, end] = text.split("-");
  return { start, end };
};

describeFeature(feature, (f: FeatureDescriibeCallbackParams) => {
  const world = createDayColouringSettingsWorld();

  f.BeforeEachScenario(async () => {
    await world.reset();
  });
  f.AfterAllScenarios(world.finish);

  const givenWorkingHoursStored = () =>
    world.storePayload(WORKING_HOURS_STORED);
  const showSettings = () => {
    world.openTab();
  };
  const typeStart = (text: string) => world.typeInto(START_LABEL_KEY, text);
  const typeEndAndConfirm = async (text: string) => {
    await world.typeInto(END_LABEL_KEY, text);
    await world.pressInField(END_LABEL_KEY, CONFIRM_KEY);
  };
  const expectHoursInForce = (_ctx: unknown, hours: string) => {
    world.runPendingWrite();
    expect(world.storedPayload().workingHours).toEqual(parseHours(hours));
  };

  // @add-day-colouring-setting @FR5 @FR6
  f.Scenario("A minute-exact start", ({ Given, And, When, Then }) => {
    Given("the colouring {string} is stored", givenWorkingHoursStored);
    And("the settings page is shown", showSettings);
    When(
      "the user types {string} as the start and confirms",
      async (_ctx, text: string) => {
        await typeStart(text);
        await world.pressInField(START_LABEL_KEY, CONFIRM_KEY);
      },
    );
    Then("the start field shows {string}", () => {
      expect(world.fieldTexts()[0]).toBe("09:07");
    });
    And("the working hours in force are 09:07-18:00", () =>
      expectHoursInForce(undefined, "09:07-18:00"),
    );
  });

  // @add-day-colouring-setting @FR5
  f.Scenario("The 12-hour format", ({ Given, And, When, Then }) => {
    Given(
      "the hour format is 12-hour and the colouring {string} is stored",
      () => world.storePayload({ ...WORKING_HOURS_STORED, hourFormat: "H12" }),
    );
    And("the settings page is shown", showSettings);
    Then(
      "the fields show {string} and {string}",
      (_ctx, start: string, end: string) => {
        expect(world.fieldTexts()).toEqual([start, end]);
      },
    );
    When(
      "the user types {string} as the end and confirms",
      (_ctx, text: string) => typeEndAndConfirm(text),
    );
    Then("the end field shows {string}", (_ctx, end: string) => {
      expect(world.fieldTexts()[1]).toBe(end);
    });
    And("the working hours in force are 10:00-17:30", () =>
      expectHoursInForce(undefined, "10:00-17:30"),
    );
  });

  // @add-day-colouring-setting @FR7
  f.ScenarioOutline(
    "Refused ranges keep the last valid hours",
    ({ Given, And, When, Then }, variables) => {
      Given("the colouring {string} is stored", givenWorkingHoursStored);
      And("the settings page is shown", showSettings);
      When(
        "the user types <start> as the start and <end> as the end and confirms",
        async () => {
          await typeStart(unquote(variables.start));
          await typeEndAndConfirm(unquote(variables.end));
        },
      );
      Then("the hint reads <hint>", () => {
        expect(world.hintText()).toBe(unquote(variables.hint));
      });
      And(
        "the working hours in force and the stored working hours are still 10:00-18:00",
        () => {
          world.runPendingWrite();
          expect(world.storedPayload().workingHours).toEqual(DEFAULT_HOURS);
        },
      );
    },
  );

  // @add-day-colouring-setting @FR6
  f.Scenario("Esc restores the stored texts", ({ Given, And, When, Then }) => {
    Given("the colouring {string} is stored", givenWorkingHoursStored);
    And("the settings page is shown", showSettings);
    And(
      "the user typed {string} as the start, which was refused",
      async (_ctx, text: string) => {
        await typeStart(text);
        await world.pressInField(START_LABEL_KEY, CONFIRM_KEY);
      },
    );
    When("the user presses Esc in the field", async () => {
      await world.pressInField(START_LABEL_KEY, ESCAPE_KEY);
    });
    Then(
      "the fields show {string} and {string} and no hint is shown",
      (_ctx, start: string, end: string) => {
        expect(world.fieldTexts()).toEqual([start, end]);
        expect(world.hintText()).toBe("");
      },
    );
  });
});
