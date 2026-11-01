// Verifies FR1–FR8, UX2 of show-clock-change-note-on-location-cards.
import type { FeatureDescriibeCallbackParams } from "@amiceli/vitest-cucumber";
import { describeFeature, loadFeature } from "@amiceli/vitest-cucumber";
import i18n from "i18next";
import { expect } from "vitest";
import { Temporal } from "@/lib/temporal";
import { ClockChangeDirection, ClockChangeTense } from "@/model";
import { HourFormat } from "@/preferences";
import { presentClockChangeNote } from "@/presenter";
import { createClockChangeNoteHandlers } from "./clockChangeNoteHandlers";
import { createClockChangeNoteWorld, LANGUAGES } from "./clockChangeNoteWorld";

const feature = await loadFeature(
  "../locations_clock_change_note_unit.feature",
);

const MINUTES_PER_TEST_HOUR = 60;
const NINETY_MINUTES = 90;

describeFeature(feature, (f: FeatureDescriibeCallbackParams) => {
  const world = createClockChangeNoteWorld();
  const {
    noteOf,
    thenNoNote,
    givenLanguage,
    givenHourFormat,
    givenZone,
    givenInstant,
    givenList,
    whenPinned,
    whenHome,
    whenOpened,
    thenNote,
    thenHasNote,
  } = createClockChangeNoteHandlers(world);

  f.BeforeEachScenario(() => world.reset());
  f.AfterEachScenario(() => world.reset());

  // @show-clock-change-note-on-location-cards @FR1 @FR2
  f.Scenario(
    "A past change at the lower bound of the window",
    ({ Given, And, When, Then }) => {
      Given("the interface language is {string}", givenLanguage);
      And("the hour format is {string}", givenHourFormat);
      And(
        "the device time zone is {string} and no home location is set",
        givenZone,
      );
      And("the current instant is {string}", givenInstant);
      And("the list contains {string}", givenList);
      When("the user opens the app", whenOpened);
      Then("the {string} row shows the clock change note {string}", thenNote);
    },
  );

  // @show-clock-change-note-on-location-cards @FR1 @FR2
  f.Scenario(
    "A future change at the upper bound of the window",
    ({ Given, And, When, Then }) => {
      Given("the interface language is {string}", givenLanguage);
      And("the hour format is {string}", givenHourFormat);
      And(
        "the device time zone is {string} and no home location is set",
        givenZone,
      );
      And("the list contains {string}", givenList);
      When("the reference moment is pinned to {string}", whenPinned);
      Then("the {string} row shows the clock change note {string}", thenNote);
    },
  );

  // @show-clock-change-note-on-location-cards @FR1
  f.ScenarioOutline(
    "Window bounds",
    ({ Given, And, When, Then }, variables) => {
      Given(
        "the device time zone is {string} and no home location is set",
        givenZone,
      );
      And("the list contains {string}", givenList);
      When("the reference moment is pinned to 09:00 UTC of {string}", () =>
        world.pin(world.pinnedAtNine(variables.date)),
      );
      Then(
        "whether the {string} row shows a clock change note is {string}",
        (_ctx, label: string) =>
          expect(world.rowOf(label).clockChangeNote !== undefined).toBe(
            variables.note === "yes",
          ),
      );
    },
  );

  // @show-clock-change-note-on-location-cards @FR1
  f.Scenario(
    "The window is counted in the reference zone",
    ({ Given, And, When, Then }) => {
      Given(
        "the device time zone is {string} and no home location is set",
        givenZone,
      );
      And("the list contains {string}", givenList);
      When("the reference moment is pinned to {string}", whenPinned);
      Then("the {string} row shows no clock change note", thenNoNote);
      When("{string} is made the home location", whenHome);
      Then("the {string} row shows a clock change note", thenHasNote);
    },
  );

  // @show-clock-change-note-on-location-cards @FR3
  f.Scenario(
    "A change on the reference day, before and after it",
    ({ Given, And, When, Then }) => {
      Given("the interface language is {string}", givenLanguage);
      And("the hour format is {string}", givenHourFormat);
      And(
        "the device time zone is {string} and no home location is set",
        givenZone,
      );
      And("the list contains {string}", givenList);
      When("the reference moment is pinned to {string}", whenPinned);
      Then("the {string} row shows the clock change note {string}", thenNote);
      When("the reference moment is then pinned to {string}", whenPinned);
      Then(
        "the {string} row now shows the clock change note {string}",
        thenNote,
      );
    },
  );

  // @show-clock-change-note-on-location-cards @FR4
  f.Scenario("Nearest of two changes", ({ Given, And, When, Then }) => {
    Given("the interface language is {string}", givenLanguage);
    And("the hour format is {string}", givenHourFormat);
    And(
      "the device time zone is {string} and no home location is set",
      givenZone,
    );
    And(
      "the list contains {string}, whose offset changed on {string} from {number} h to {number} h and on {string} from {number} h to {number} h",
      (
        _ctx,
        label: string,
        firstInstant: string,
        firstFrom: number,
        firstTo: number,
        secondInstant: string,
        _secondFrom: number,
        secondTo: number,
      ) => {
        world.setList(label);
        world.stubRules(label, {
          initialOffsetMinutes: firstFrom * MINUTES_PER_TEST_HOUR,
          changes: [
            {
              instant: firstInstant,
              offsetMinutesAfter: firstTo * MINUTES_PER_TEST_HOUR,
            },
            {
              instant: secondInstant,
              offsetMinutesAfter: secondTo * MINUTES_PER_TEST_HOUR,
            },
          ],
        });
      },
    );
    When("the reference moment is pinned to {string}", whenPinned);
    Then("the {string} row shows the clock change note {string}", thenNote);
    When("the reference moment is then pinned to {string}", whenPinned);
    Then("the {string} row now shows the clock change note {string}", thenNote);
  });

  // @show-clock-change-note-on-location-cards @FR2 @FR8
  f.Scenario("A change of 30 minutes", ({ Given, And, When, Then }) => {
    Given(
      "the device time zone is {string} and no home location is set",
      givenZone,
    );
    And("the list contains {string}", givenList);
    When("the reference moment is pinned to {string}", whenPinned);
    Then(
      "in {string} the {string} row shows {string}",
      (_ctx, language: string, label: string, text: string) => {
        world.setLanguage(language);
        expect(noteOf(label)).toBe(text);
      },
    );
    And(
      "in {string} it shows {string}",
      (_ctx, language: string, text: string) => {
        world.setLanguage(language);
        expect(noteOf("Lord Howe Island")).toBe(text);
      },
    );
  });

  // @show-clock-change-note-on-location-cards @FR2
  f.Scenario(
    "A permanent change of the offset",
    ({ Given, And, When, Then }) => {
      Given("the interface language is {string}", givenLanguage);
      And("the hour format is {string}", givenHourFormat);
      And(
        "the device time zone is {string} and no home location is set",
        givenZone,
      );
      And("the list contains {string}", givenList);
      When("the reference moment is pinned to {string}", whenPinned);
      Then("the {string} row shows the clock change note {string}", thenNote);
    },
  );

  // @show-clock-change-note-on-location-cards @FR2 @FR8 @UX2
  f.ScenarioOutline(
    "Texts in both languages",
    ({ Given, And, When, Then }, variables) => {
      Given(
        "the device time zone is {string} and no home location is set",
        givenZone,
      );
      And("the hour format is {string}", givenHourFormat);
      And("the list contains {string}", givenList);
      When("the reference moment is pinned to {string} in {string}", () => {
        world.setLanguage(variables.language);
        world.pin(variables.instant);
      });
      Then(
        "the {string} row shows the clock change note {string}",
        (_ctx, label: string) => thenNote(_ctx, label, variables.text),
      );
    },
  );

  // @show-clock-change-note-on-location-cards @FR2 @FR8 @UX2
  f.Scenario("Amount with hours and minutes", ({ When, Then }) => {
    const amountsByLanguage = new Map<string, string>();
    When(
      "a clock change of {int} minutes forward in the future is presented in English and in Russian",
      (_ctx, amountMinutes: number) => {
        expect(amountMinutes).toBe(NINETY_MINUTES);
        for (const language of ["en", "ru"] as const) {
          const note = presentClockChangeNote({
            clockChange: {
              instant: Temporal.Instant.from("2026-10-04T15:30:00Z"),
              direction: ClockChangeDirection.FORWARD,
              amountMinutes,
              wallClockTime: Temporal.PlainDateTime.from("2026-10-04T02:00"),
            },
            tense: ClockChangeTense.FUTURE,
            language,
            hourFormat: HourFormat.H24,
            translate: i18n.getFixedT(language),
          });
          amountsByLanguage.set(language, note);
        }
      },
    );
    Then(
      "the amount reads {string} and {string}",
      (_ctx, english: string, russian: string) => {
        expect(amountsByLanguage.get(LANGUAGES.English)).toContain(
          `forward ${english}`,
        );
        expect(amountsByLanguage.get(LANGUAGES.Russian)).toContain(
          `на ${russian} вперёд`,
        );
      },
    );
  });
});
