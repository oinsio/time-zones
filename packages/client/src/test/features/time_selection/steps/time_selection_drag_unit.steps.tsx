// Verifies FR1, FR3, FR4, NFR-P1 of fix-day-track-drag-continuity-and-smoothness.
import type { FeatureDescriibeCallbackParams } from "@amiceli/vitest-cucumber";
import { describeFeature, loadFeature } from "@amiceli/vitest-cucumber";
import { cleanup } from "@testing-library/react/pure";
import { expect, vi } from "vitest";
import { startWorkCount } from "@/test/workCounters";
import { createDayTrackSteps } from "./dayTrackSteps";
import {
  createDragDriver,
  createThenPinned,
  DragPointer,
  OFFSET_ABOVE_PX,
  OFFSET_BELOW_PX,
  PAST_RIGHT_END,
} from "./dragSteps";
import { createTimeSelectionWorld } from "./timeSelectionWorld";

type StepDefiners = Parameters<
  Parameters<FeatureDescriibeCallbackParams["Scenario"]>[1]
>[0];

const feature = await loadFeature("../time_selection_drag_unit.feature");

const PERCENT_PRECISION = 4;
const PERCENT_PER_FRACTION = 100;
const THREE_QUARTERS = 0.75;

describeFeature(feature, (f: FeatureDescriibeCallbackParams) => {
  const world = createTimeSelectionWorld();
  const steps = createDayTrackSteps(world);
  const driver = createDragDriver(world);

  f.BeforeEachScenario(() => world.reset());
  f.AfterEachScenario(() => {
    cleanup();
    vi.unstubAllGlobals();
    vi.resetModules();
  });
  f.AfterAllScenarios(world.finish);

  const thenPinned = createThenPinned(world);
  const thenCardShows = (_ctx: unknown, city: string, time: string) =>
    expect(world.rowOf(city).localTimeLabel).toBe(time);
  const givenCommon = ({ Given, And }: Pick<StepDefiners, "Given" | "And">) => {
    Given("the device time zone is {string}", steps.givenZone);
    And("the current instant is {string}", steps.givenInstant);
    And("the list contains {string}", steps.givenList);
    And("the app is open", steps.givenAppOpen);
  };

  // @fix-day-track-drag-continuity-and-smoothness @FR1 @FR4 @UX1 @UX3
  f.ScenarioOutline(
    "A drag continues when the pointer leaves the track",
    ({ Given, And, When, Then }, variables) => {
      givenCommon({ Given, And });
      When(
        "the user drags the <pointer> from a quarter to three quarters of the New York track, 120 px below it",
        async () => {
          await driver.dragAlong(
            "New York",
            variables.pointer as DragPointer,
            THREE_QUARTERS,
            OFFSET_BELOW_PX,
          );
          driver.release(THREE_QUARTERS, OFFSET_BELOW_PX);
        },
      );
      Then("the moment is pinned to {string}", thenPinned);
      And("the {string} card shows {string}", thenCardShows);
    },
  );

  // @fix-day-track-drag-continuity-and-smoothness @FR1
  f.Scenario(
    "A drag past the right end pins the track end",
    ({ Given, And, When, Then }) => {
      givenCommon({ Given, And });
      When(
        "the user drags the finger from a quarter to past the right end of the {string} track, 60 px above it",
        async (_ctx: unknown, city: string) => {
          await driver.dragAlong(
            city,
            DragPointer.FINGER,
            PAST_RIGHT_END,
            OFFSET_ABOVE_PX,
          );
          driver.release(PAST_RIGHT_END, OFFSET_ABOVE_PX);
        },
      );
      Then("the moment is pinned to {string}", thenPinned);
      And("the {string} card shows {string}", thenCardShows);
    },
  );

  // @fix-day-track-drag-continuity-and-smoothness @FR3 @UX2
  f.Scenario(
    "The dragged handle follows the pointer between track steps",
    ({ Given, And, When, Then }) => {
      givenCommon({ Given, And });
      When(
        "the user holds the mouse at {number} of the {string} track during a drag",
        (_ctx: unknown, at: number, city: string) => driver.holdMouse(city, at),
      );
      Then(
        "the {string} handle stands at {string}",
        (_ctx: unknown, _city: string, left: string) =>
          expect(driver.handleLeft()).toBe(left),
      );
      And("the moment is pinned to {string}", thenPinned);
      And(
        "the {string} handle stands at {number}",
        (_ctx: unknown, city: string, fraction: number) =>
          expect(
            Number.parseFloat(driver.handleLeftOf(city)) / PERCENT_PER_FRACTION,
          ).toBeCloseTo(fraction, PERCENT_PRECISION + 2),
      );
    },
  );

  // @fix-day-track-drag-continuity-and-smoothness @FR3 @UX2
  f.Scenario(
    "The handle settles on the selected step at release",
    ({ Given, And, When, Then }) => {
      givenCommon({ Given, And });
      And(
        "the user holds the mouse at {number} of the {string} track during a drag",
        (_ctx: unknown, at: number, city: string) => driver.holdMouse(city, at),
      );
      When("the user releases the pointer", () => driver.release(0.512, 0));
      Then(
        "the {string} handle stands at {number}",
        (_ctx: unknown, _city: string, fraction: number) =>
          expect(
            Number.parseFloat(driver.handleLeft()) / PERCENT_PER_FRACTION,
          ).toBeCloseTo(fraction, PERCENT_PRECISION + 2),
      );
      And("the moment is pinned to {string}", thenPinned);
    },
  );

  // @fix-day-track-drag-continuity-and-smoothness @FR4
  f.Scenario(
    "A finger drag adds no selection when the finger lifts",
    ({ Given, And, When, Then }) => {
      givenCommon({ Given, And });
      And(
        "the user drags the finger without Pointer Events to three quarters of the {string} track",
        (_ctx: unknown, city: string) =>
          driver.dragAlong(
            city,
            DragPointer.FINGER_WITHOUT_POINTER_EVENTS,
            THREE_QUARTERS,
            0,
          ),
      );
      When("the user lifts the finger and a click follows", () => {
        driver.release(THREE_QUARTERS, 0);
        driver.clickAfterLift(0.5);
      });
      Then("the moment is pinned to {string}", thenPinned);
    },
  );

  // @fix-day-track-drag-continuity-and-smoothness @NFR-P1
  f.Scenario(
    "A drag move inside the pinned track step re-presents no row",
    ({ Given, And, When, Then }) => {
      let rowsBefore: readonly object[] = [];
      let workCount: ReturnType<typeof startWorkCount>;
      givenCommon({ Given, And });
      And(
        "the user holds the mouse at {number} of the {string} track during a drag",
        (_ctx: unknown, at: number, city: string) => driver.holdMouse(city, at),
      );
      When(
        "the pointer moves on to {number} of the track, counting work",
        (_ctx: unknown, at: number) => {
          rowsBefore = [...world.rows()];
          workCount = startWorkCount();
          driver.moveTo(at, 0);
          workCount.stop();
        },
      );
      Then("the moment is pinned to {string}", thenPinned);
      And("every row is the same object as before the move", () => {
        const rowsAfter = world.rows();
        expect(rowsAfter).toHaveLength(rowsBefore.length);
        for (const [index, row] of rowsAfter.entries()) {
          expect(row).toBe(rowsBefore[index]);
        }
      });
      And("no formatter is built", () =>
        expect(workCount.formatters()).toBe(0),
      );
    },
  );
});
