// Verifies FR5, FR6 of show-clock-change-note-on-location-cards.
import type { FeatureDescriibeCallbackParams } from "@amiceli/vitest-cucumber";
import { describeFeature, loadFeature } from "@amiceli/vitest-cucumber";
import { expect } from "vitest";
import { createClockChangeNoteHandlers } from "./clockChangeNoteHandlers";
import {
  createClockChangeNoteWorld,
  DEVICE_TIME_LOCATION_LABEL,
} from "./clockChangeNoteWorld";

const feature = await loadFeature(
  "../locations_clock_change_note_placement.feature",
);

const TENSE_PHRASES = { past: "clocks went", future: "clocks will go" };

describeFeature(feature, (f: FeatureDescriibeCallbackParams) => {
  const world = createClockChangeNoteWorld();
  const {
    noteOf,
    thenNoNote,
    givenZone,
    givenInstant,
    givenList,
    whenPinned,
    whenHome,
    whenTyped,
    thenNote,
    thenHasNote,
    thenHintOnly,
  } = createClockChangeNoteHandlers(world);

  f.BeforeEachScenario(() => world.reset());
  f.AfterEachScenario(() => world.reset());

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
});
