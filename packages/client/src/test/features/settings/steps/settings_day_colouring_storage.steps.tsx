// Verifies FR2, FR3, FR7 of add-day-colouring-setting.
import type { FeatureDescriibeCallbackParams } from "@amiceli/vitest-cucumber";
import { describeFeature, loadFeature } from "@amiceli/vitest-cucumber";
import { expect, vi } from "vitest";
import { PREFERENCES_SCHEMA_VERSION } from "@/constants";
import { DayColouring, HourFormat, ThemePreference } from "@/preferences";
import { DayColour } from "@/presenter";
import { createDayColouringSettingsWorld } from "./dayColouringSettingsWorld";

vi.mock(
  "virtual:pwa-register/react",
  async () =>
    (await import("@/test/fakeServiceWorker")).fakeServiceWorkerModule,
);

const feature = await loadFeature("../settings_day_colouring_storage.feature");
const START_LABEL_KEY = "settings.workingHoursStartLabel";
const END_LABEL_KEY = "settings.workingHoursEndLabel";
const CONFIRM_KEY = "{Enter}";
/** The schema version before the day colouring existed. */
const SCHEMA_VERSION_BEFORE_DAY_COLOURING = 5;
const COLOURING_BY_NAME: Record<string, string> = {
  Plain: "PLAIN",
  "Time of day": "TIME_OF_DAY",
  "Working hours": "WORKING_HOURS",
};
const WORKING_COLOURS = [DayColour.WORKING_TIME, DayColour.NON_WORKING_TIME];

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

  const givenList = (_ctx: unknown, city: string) => world.setList(city);
  const showSettings = () => {
    world.openTab();
  };
  const confirmHours = async (start: string, end: string, tabIndex = 0) => {
    const tab = world.tabs()[tabIndex];
    await world.typeInto(START_LABEL_KEY, start, tab);
    await world.typeInto(END_LABEL_KEY, end, tab);
    await world.pressInField(END_LABEL_KEY, CONFIRM_KEY, tab);
  };
  const chooseAndConfirm = async (name: string) => {
    world.openTab();
    await world.chooseColouring(name);
    await confirmHours("907", "17:30");
    world.runPendingWrite();
  };
  const reopen = () => {
    world.closeTabs();
    world.openTab();
  };
  const openTwoTabsWith = (colouring: string) => {
    world.givenTwoTabs();
    world.storePayload({ dayColouring: COLOURING_BY_NAME[unquote(colouring)] });
    world.openTab();
    world.openTab();
  };
  const expectFieldTexts = (_ctx: unknown, start: string, end: string) =>
    expect(world.fieldTexts()).toEqual([start, end]);

  // @add-day-colouring-setting @FR3 @FR7
  f.Scenario(
    "Colouring and working hours survive a reload",
    ({ Given, And, When, Then }) => {
      Given("the list contains {string}", givenList);
      And(
        "the user chose the colouring {string} and confirmed 09:07-17:30",
        (_ctx, name: string) => chooseAndConfirm(name),
      );
      When("the app is opened again", reopen);
      Then(
        "the colouring {string} is checked and the fields show {string} and {string}",
        (_ctx, name: string, start: string, end: string) => {
          expect(world.checkedOptionName()).toBe(name);
          expectFieldTexts(undefined, start, end);
        },
      );
      And(
        "the Almaty track shows the Working hours colouring from the first render",
        () => {
          const colours = world.trackColours("Almaty");
          expect(colours.length).toBeGreaterThan(0);
          expect(
            colours.every((colour) => WORKING_COLOURS.includes(colour)),
          ).toBe(true);
        },
      );
    },
  );

  // @add-day-colouring-setting @FR3 @M1
  f.ScenarioOutline(
    "Each colouring is kept and shared",
    ({ Given, And, When, Then }, variables) => {
      Given("the list contains {string}", givenList);
      And("the app is open in two tabs with the colouring <other>", () =>
        openTwoTabsWith(variables.other),
      );
      When("the user chooses <colouring> in the first tab", async () => {
        await world.chooseColouring(
          unquote(variables.colouring),
          world.tabs()[0],
        );
        world.runPendingWrite(world.tabs()[0]);
      });
      Then("the second tab has <colouring> checked without a reload", () => {
        expect(world.checkedOptionName(world.tabs()[1])).toBe(
          unquote(variables.colouring),
        );
      });
      And("when the app is opened again <colouring> is checked", () => {
        reopen();
        expect(world.checkedOptionName()).toBe(unquote(variables.colouring));
      });
    },
  );

  // @add-day-colouring-setting @FR7
  f.Scenario(
    "Working hours are kept across colourings",
    ({ Given, When, And, Then }) => {
      Given(
        "the user chose the colouring {string} and confirmed 09:07-17:30",
        (_ctx, name: string) => chooseAndConfirm(name),
      );
      When("the user chooses the colouring {string}", (_ctx, name: string) =>
        world.chooseColouring(name),
      );
      And("the user chooses the colouring {string}", (_ctx, name: string) =>
        world.chooseColouring(name),
      );
      Then("the fields show {string} and {string}", expectFieldTexts);
    },
  );

  // @add-day-colouring-setting @FR2
  f.Scenario("Existing users get Time of day", ({ Given, When, Then, And }) => {
    let documentBefore: string | null = null;
    Given(
      "the stored preferences document was written before the day colouring existed, with the theme {string}, the hour format {string}, the language {string}, the view {string} and only the UTC offset in the zone label",
      () => {
        world.storeDocument(SCHEMA_VERSION_BEFORE_DAY_COLOURING, {
          theme: "DARK",
          hourFormat: "H12",
          interfaceLanguage: "ru",
          viewMode: "grid",
          zoneLabelParts: ["UTC_OFFSET"],
        });
        documentBefore = world.storedText();
      },
    );
    When("the settings page is shown", showSettings);
    Then(
      "the day colouring is Time of day and the working hours are 10:00-18:00",
      () => {
        expect(world.checkedOptionName()).toBe("Time of day");
        expect(world.loadStoredPreferences()?.workingHours).toEqual(
          parseHours("10:00-18:00"),
        );
      },
    );
    And(
      "the theme {string}, the hour format {string}, the language {string} and the view {string} are kept",
      () => {
        expect(world.loadStoredPreferences()).toMatchObject({
          theme: ThemePreference.DARK,
          hourFormat: HourFormat.H12,
          interfaceLanguage: "ru",
          viewMode: "grid",
          dayColouring: DayColouring.TIME_OF_DAY,
        });
      },
    );
    And(
      "the stored document is not rewritten until the user changes a setting",
      () => {
        world.runPendingWrite();
        expect(world.storedText()).toBe(documentBefore);
      },
    );
  });

  // @add-day-colouring-setting @FR7
  f.Scenario(
    "A broken stored range is unreadable",
    ({ Given, When, Then, And }) => {
      Given("the stored preferences hold the working hours 18:00-10:00", () =>
        world.storeDocument(PREFERENCES_SCHEMA_VERSION, {
          theme: "SYSTEM",
          hourFormat: "H24",
          interfaceLanguage: null,
          zoneLabelParts: ["UTC_OFFSET"],
          viewMode: null,
          dayColouring: "PLAIN",
          workingHours: parseHours("18:00-10:00"),
        }),
      );
      When("the settings page is shown", showSettings);
      Then("the settings page shows the unreadable note", () => {
        expect(world.hasUnreadableNote()).toBe(true);
      });
      And("the day colouring Time of day is in force", () => {
        expect(world.checkedOptionName()).toBe("Time of day");
      });
    },
  );

  // @add-day-colouring-setting @FR3
  f.Scenario(
    "Another tab changes the colouring",
    ({ Given, And, When, Then }) => {
      Given("the list contains {string}", givenList);
      And(
        "the app is open in two tabs with the colouring {string}",
        (_ctx, name: string) => openTwoTabsWith(name),
      );
      When(
        "the user chooses {string} in the first tab",
        async (_ctx, name: string) => {
          await world.chooseColouring(name, world.tabs()[0]);
          world.runPendingWrite(world.tabs()[0]);
        },
      );
      Then("the second tab shows a plain Almaty track without a reload", () => {
        expect(world.trackColours("Almaty", world.tabs()[1])).toEqual([
          DayColour.PLAIN,
        ]);
      });
    },
  );

  // @add-day-colouring-setting @FR7
  f.Scenario(
    "Another tab changes the working hours",
    ({ Given, When, Then }) => {
      Given(
        "the app is open in two tabs with the colouring {string}",
        (_ctx, name: string) => openTwoTabsWith(name),
      );
      When("the user confirms 09:00-17:00 in the first tab", async () => {
        await confirmHours("09:00", "17:00");
        world.runPendingWrite(world.tabs()[0]);
      });
      Then(
        "the second tab shows the fields {string} and {string} without a reload",
        (_ctx, start: string, end: string) => {
          expect(world.fieldTexts(world.tabs()[1])).toEqual([start, end]);
        },
      );
    },
  );
});
