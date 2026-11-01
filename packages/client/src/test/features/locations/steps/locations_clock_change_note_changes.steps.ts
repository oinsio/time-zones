// Verifies FR2, FR4, FR8 of show-clock-change-note-on-location-cards.
import type { FeatureDescriibeCallbackParams } from "@amiceli/vitest-cucumber";
import { describeFeature, loadFeature } from "@amiceli/vitest-cucumber";
import { expect } from "vitest";
import { createClockChangeNoteHandlers } from "./clockChangeNoteHandlers";
import { createClockChangeNoteWorld } from "./clockChangeNoteWorld";

const feature = await loadFeature(
  "../locations_clock_change_note_changes.feature",
);

const MINUTES_PER_TEST_HOUR = 60;

describeFeature(feature, (f: FeatureDescriibeCallbackParams) => {
  const world = createClockChangeNoteWorld();
  const {
    noteOf,
    givenLanguage,
    givenHourFormat,
    givenZone,
    givenList,
    whenPinned,
    thenNote,
  } = createClockChangeNoteHandlers(world);

  f.BeforeEachScenario(() => world.reset());
  f.AfterEachScenario(() => world.reset());

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
});
