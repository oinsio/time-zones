import type { FeatureDescriibeCallbackParams } from "@amiceli/vitest-cucumber";
import { MAX_TRACK_FRACTION } from "@/constants";
import type { createSelectTimeSteps } from "./selectTimeSteps";
import type { createTimeSelectionWorld } from "./timeSelectionWorld";

// Verifies FR1, FR2 of fix-day-track-handle-overlap-and-end-of-day (track end scenarios).
export const registerTrackEndScenarios = (
  f: FeatureDescriibeCallbackParams,
  world: ReturnType<typeof createTimeSelectionWorld>,
  steps: ReturnType<typeof createSelectTimeSteps>,
) => {
  const {
    givenZone,
    givenInstant,
    givenList,
    givenAppOpen,
    givenPinnedHere,
    whenKey,
    thenPinned,
    thenCardShows,
  } = steps;

  // @fix-day-track-handle-overlap-and-end-of-day @FR1 @UX2
  f.ScenarioOutline(
    "The right end reaches the last minute of 23- and 25-hour days",
    ({ Given, And, When, Then }, variables) => {
      Given("the device time zone is {string}", givenZone);
      And("the current instant is <instant>", () =>
        givenInstant(undefined, variables.instant),
      );
      And("the list contains {string}", givenList);
      And("the app is open", givenAppOpen);
      When("the user selects the fraction 1.0 of the track", () =>
        world.selectFraction(MAX_TRACK_FRACTION),
      );
      Then("the {string} card shows {string}", thenCardShows);
    },
  );

  // @fix-day-track-handle-overlap-and-end-of-day @FR2
  f.ScenarioOutline(
    "Keys around the track end",
    ({ Given, And, When, Then }, variables) => {
      Given("the device time zone is {string}", givenZone);
      And("the current instant is <from>", () =>
        givenInstant(undefined, variables.from),
      );
      And("the list contains {string}", givenList);
      And("the app is open", givenAppOpen);
      And("the moment is pinned at its current position", givenPinnedHere);
      When("the user moves the handle with <key>", () =>
        whenKey(undefined, variables.key),
      );
      Then("the moment is pinned to <pinned>", () =>
        thenPinned(undefined, variables.pinned),
      );
    },
  );
};
