// Verifies FR1, FR2, FR3, FR4 of fix-day-track-handle-overlap-and-end-of-day.
import type { FeatureDescriibeCallbackParams } from "@amiceli/vitest-cucumber";
import { describeFeature, loadFeature } from "@amiceli/vitest-cucumber";
import {
  cleanup,
  fireEvent,
  render,
  screen,
} from "@testing-library/react/pure";
import { expect, vi } from "vitest";
import { createDayTrackSteps } from "./dayTrackSteps";
import { createTimeSelectionWorld } from "./timeSelectionWorld";

const feature = await loadFeature("../time_selection_legacy_tap.feature");

const TRACK_WIDTH_PX = 400;
const THREE_QUARTERS = 0.75;

describeFeature(feature, (f: FeatureDescriibeCallbackParams) => {
  const world = createTimeSelectionWorld();
  const steps = createDayTrackSteps(world);
  let hasPointerEvents = true;

  f.BeforeEachScenario(async () => {
    hasPointerEvents = true;
    await world.reset();
  });
  f.AfterEachScenario(() => {
    cleanup();
    vi.unstubAllGlobals();
    vi.resetModules();
  });
  f.AfterAllScenarios(world.finish);

  const givenNoPointerEvents = () => {
    hasPointerEvents = false;
  };
  const givenPointerEvents = () => {
    hasPointerEvents = true;
  };
  const whenUserTaps = async (_ctx: unknown, city: string) => {
    if (!hasPointerEvents) vi.stubGlobal("PointerEvent", undefined);
    vi.resetModules();
    const { DayTrack } = await import("@/views/shared/DayTrack");
    render(
      <DayTrack
        track={world.trackOf(city)}
        city={city}
        onSelectFraction={world.selectFraction}
        onMoveTrack={world.moveTrack}
      />,
    );
    const slider = screen.getByRole("slider");
    const bar = slider.querySelector<HTMLElement>(
      "[data-day-track-bar]",
    ) as HTMLElement;
    bar.getBoundingClientRect = () =>
      ({ left: 0, width: TRACK_WIDTH_PX }) as DOMRect;
    fireEvent.click(slider, { clientX: TRACK_WIDTH_PX * THREE_QUARTERS });
  };
  const thenPinned = (_ctx: unknown, timestamp: string) => {
    expect(world.isNowActive()).toBe(true);
    expect(world.shownInstant()).toBe(timestamp);
  };

  // @support-legacy-ios-12-safari @FR8 @UX1
  f.Scenario(
    "A tap selects a time without Pointer Events",
    ({ Given, And, When, Then }) => {
      Given("the device time zone is {string}", steps.givenZone);
      And("the current instant is {string}", steps.givenInstant);
      And("the list contains {string}", steps.givenList);
      And("the app is open", steps.givenAppOpen);
      And("the engine has no Pointer Events", givenNoPointerEvents);
      When("the user taps three quarters of the {string} track", whenUserTaps);
      Then("the moment is pinned to {string}", thenPinned);
      And(
        "the {string} card shows {string}",
        (_ctx: unknown, city: string, time: string) =>
          expect(world.rowOf(city).localTimeLabel).toBe(time),
      );
    },
  );

  // @support-legacy-ios-12-safari @FR8
  f.Scenario(
    "A click adds nothing where Pointer Events exist",
    ({ Given, And, When, Then }) => {
      Given("the device time zone is {string}", steps.givenZone);
      And("the current instant is {string}", steps.givenInstant);
      And("the list contains {string}", steps.givenList);
      And("the app is open", steps.givenAppOpen);
      And("the engine has Pointer Events", givenPointerEvents);
      When("the user taps three quarters of the {string} track", whenUserTaps);
      Then("the moment is not pinned", () =>
        expect(world.isNowActive()).toBe(false),
      );
    },
  );
});
