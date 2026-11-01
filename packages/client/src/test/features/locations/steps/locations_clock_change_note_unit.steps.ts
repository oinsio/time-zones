// Verifies FR1–FR8, UX2 of show-clock-change-note-on-location-cards.
import type { FeatureDescriibeCallbackParams } from "@amiceli/vitest-cucumber";
import { describeFeature, loadFeature } from "@amiceli/vitest-cucumber";
import i18n from "i18next";
import { expect } from "vitest";
import { Temporal } from "@/lib/temporal";
import { ClockChangeDirection, ClockChangeTense } from "@/model";
import { HourFormat } from "@/preferences";
import { presentClockChangeNote } from "@/presenter";
import {
  createClockChangeNoteWorld,
  DEVICE_TIME_LOCATION_LABEL,
  LANGUAGES,
  plainSpaces,
} from "./clockChangeNoteWorld";

const feature = await loadFeature(
  "../locations_clock_change_note_unit.feature",
);

const MINUTES_PER_TEST_HOUR = 60;
const NINETY_MINUTES = 90;
const TENSE_PHRASES = { past: "clocks went", future: "clocks will go" };

describeFeature(feature, (f: FeatureDescriibeCallbackParams) => {
  const world = createClockChangeNoteWorld();
  const noteOf = (label: string) =>
    plainSpaces(world.rowOf(label).clockChangeNote);

  f.BeforeEachScenario(() => world.reset());
  f.AfterEachScenario(() => world.reset());

  const givenLanguage = (_ctx: unknown, name: string) =>
    world.setLanguage(name);
  const givenHourFormat = (_ctx: unknown, name: string) =>
    world.setHourFormat(name);
  const givenZone = (_ctx: unknown, timeZoneId: string) =>
    world.setDeviceTimeZone(timeZoneId);
  const givenInstant = (_ctx: unknown, timestamp: string) =>
    world.setNow(timestamp);
  const givenList = (_ctx: unknown, labels: string) => world.setList(labels);
  const whenPinned = (_ctx: unknown, instant: string) => world.pin(instant);
  const thenNote = (_ctx: unknown, label: string, text: string) =>
    expect(noteOf(label)).toBe(text);
  const thenHasNote = (_ctx: unknown, label: string) =>
    expect(world.rowOf(label).clockChangeNote).toBeDefined();
  const thenNoNote = (_ctx: unknown, label: string) =>
    expect(world.rowOf(label).clockChangeNote).toBeUndefined();
  const whenHome = (_ctx: unknown, label: string) => world.setHome(label);
  const whenOpened = () => undefined;
  const whenTyped = (_ctx: unknown, time: string, label: string) =>
    world.typeWallTime(label, time);
  const thenHintOnly = (_ctx: unknown, label: string) => {
    const row = world.rowOf(label);
    expect(row.wallTimeHint).toBeDefined();
    expect(row.clockChangeNote).toBeUndefined();
  };

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

  // @show-clock-change-note-on-location-cards @FR5
  f.Scenario(
    "No note for a zone without changes",
    ({ Given, And, When, Then }) => {
      Given(
        "the device time zone is {string} and no home location is set",
        givenZone,
      );
      And("the list contains {string}", givenList);
      When("the reference moment is pinned to {string}", whenPinned);
      Then("the {string} row shows a clock change note", thenHasNote);
      And(
        "the rows {string} show no clock change note",
        (_ctx, labels: string) => {
          for (const label of labels.split(", ")) thenNoNote(_ctx, label);
        },
      );
    },
  );

  // @show-clock-change-note-on-location-cards @FR5
  f.Scenario(
    "Home location and device time location show the note",
    ({ Given, And, When, Then }) => {
      Given("the device time zone is {string}", givenZone);
      And("the list contains {string}", givenList);
      And("{string} is the home location", whenHome);
      When("the reference moment is pinned to {string}", whenPinned);
      Then(
        "the device time location shows a clock change note about {string} in the {word} tense",
        (_ctx, date: string, tense: string) => {
          const note = noteOf(DEVICE_TIME_LOCATION_LABEL);
          expect(note).toContain(date);
          expect(note).toContain(TENSE_PHRASES[tense as "past" | "future"]);
        },
      );
      And(
        "the {string} row shows a clock change note about {string} in the {word} tense",
        (_ctx, label: string, date: string, tense: string) => {
          const note = noteOf(label);
          expect(note).toContain(date);
          expect(note).toContain(TENSE_PHRASES[tense as "past" | "future"]);
        },
      );
    },
  );

  // @show-clock-change-note-on-location-cards @FR5
  f.Scenario("Unknown zone", ({ Given, And, When, Then }) => {
    Given(
      "the device time zone is {string} and no home location is set",
      givenZone,
    );
    And(
      "the list contains {string}, where {string} has a zone the browser does not know",
      (_ctx, labels: string, unknownLabel: string) => {
        world.setList(labels);
        world.addUnknownZoneLocation(unknownLabel);
      },
    );
    When("the reference moment is pinned to {string}", whenPinned);
    Then("the {string} row shows no clock change note", thenNoNote);
    And("the {string} row shows a clock change note", thenHasNote);
  });

  // @show-clock-change-note-on-location-cards @FR7
  f.Scenario(
    "The note follows the date bar and the settings",
    ({ Given, And, When, Then }) => {
      Given(
        "the device time zone is {string} and no home location is set",
        givenZone,
      );
      And("the list contains {string}", givenList);
      And("the reference moment is pinned to {string}", whenPinned);
      Then("the {string} row shows a clock change note", thenHasNote);
      When("the date moves to the next day", () => world.shiftDate(1));
      Then("the {string} row shows no clock change note", thenNoNote);
      When("the date moves to the previous day", () => world.shiftDate(-1));
      And(
        "the hour format becomes {string} in {string}",
        (_ctx, hourFormat: string, language: string) => {
          world.setHourFormat(hourFormat);
          world.setLanguage(language);
        },
      );
      Then("the {string} row shows the clock change note {string}", thenNote);
    },
  );

  // @show-clock-change-note-on-location-cards @FR6
  f.Scenario(
    "The wall-time hint wins in its row only",
    ({ Given, And, When, Then }) => {
      Given(
        "the device time zone is {string} and no home location is set",
        givenZone,
      );
      And("the current instant is {string}", givenInstant);
      And("the list contains {string}", givenList);
      When("the user types {string} in {string}", whenTyped);
      Then(
        "{string} shows the wall-time hint and no clock change note",
        thenHintOnly,
      );
      And("the {string} row shows no clock change note", thenNoNote);
    },
  );

  // @show-clock-change-note-on-location-cards @FR6
  f.Scenario(
    "Other rows keep their notes next to a hint",
    ({ Given, And, When, Then }) => {
      Given(
        "the device time zone is {string} and no home location is set",
        givenZone,
      );
      And("the current instant is {string}", givenInstant);
      And("the list contains {string}", givenList);
      When("the user types {string} in {string}", whenTyped);
      Then(
        "{string} shows the wall-time hint and no clock change note",
        thenHintOnly,
      );
      And("the {string} row shows a clock change note", thenHasNote);
    },
  );

  // @show-clock-change-note-on-location-cards @FR6
  f.Scenario(
    "The note returns when the hint ends",
    ({ Given, And, When, Then }) => {
      Given(
        "the device time zone is {string} and no home location is set",
        givenZone,
      );
      And("the current instant is {string}", givenInstant);
      And("the list contains {string}", givenList);
      And("the user typed {string} in {string}", whenTyped);
      When(
        "the user selects {string} on a day track of the same reference day",
        whenPinned,
      );
      Then("{string} shows no wall-time hint", (_ctx, label: string) =>
        expect(world.rowOf(label).wallTimeHint).toBeUndefined(),
      );
      And("the {string} row shows a clock change note", thenHasNote);
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
