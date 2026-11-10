// Verifies FR10, FR12 of add-grid-meeting-range-and-share.
import type { FeatureDescriibeCallbackParams } from "@amiceli/vitest-cucumber";
import { describeFeature, loadFeature } from "@amiceli/vitest-cucumber";
import { expect } from "vitest";
import { Temporal } from "@/lib/temporal";
import {
  getMeetingRangeAfterHandleMove,
  getMeetingRangeAtHandleMinutes,
  getReferenceDay,
  MeetingHandle,
  type MeetingRange,
  TrackMove,
} from "@/model";
import {
  ALMATY_ZONE,
  createMeetingWorld,
  SAMPLE_NOW,
  spanIn,
} from "./meetingRangeWorld";

const feature = await loadFeature("../meeting_range_handles.feature");

const HANDLES: Record<string, MeetingHandle> = {
  start: MeetingHandle.START,
  end: MeetingHandle.END,
};
const MOVES: Record<string, TrackMove> = {
  "next step": TrackMove.NEXT_STEP,
  "an hour back": TrackMove.HOUR_BACK,
  "an hour forward": TrackMove.HOUR_FORWARD,
  "day start": TrackMove.DAY_START,
  "day end": TrackMove.DAY_END,
};
const TO_THE_DAY_END = "09:00 to the end of the reference day";
const DRAGGED_MINUTES = 7 * 60 + 40;

describeFeature(feature, (f: FeatureDescriibeCallbackParams) => {
  const world = createMeetingWorld();
  let range: MeetingRange;
  const referenceDay = () =>
    getReferenceDay(world.state(), Temporal.Instant.from(SAMPLE_NOW));

  const openSample = () => {
    world.openWithSampleMeeting();
    range = world.state().meeting as MeetingRange;
  };

  // @add-grid-meeting-range-and-share @FR12
  f.ScenarioOutline(
    "Keyboard moves of the handles",
    ({ Given, When, Then }, variables) => {
      Given(
        "the reference zone is {string} and the meeting range is 09:00–11:00 on 2026-03-08",
        openSample,
      );
      When("the <handle> handle makes the move <move>", () => {
        range = getMeetingRangeAfterHandleMove(
          referenceDay(),
          range,
          HANDLES[variables.handle],
          MOVES[variables.move],
        );
      });
      Then("the meeting range is <range>", () => {
        if (variables.range === TO_THE_DAY_END) {
          expect(range.start.toString()).toBe("2026-03-08T04:00:00Z");
          expect(range.end.equals(referenceDay().end)).toBe(true);
          return;
        }
        expect(spanIn(range, ALMATY_ZONE)).toBe(variables.range);
      });
    },
  );

  // @add-grid-meeting-range-and-share @FR10
  f.Scenario("A drag cannot cross the other end", ({ Given, When, Then }) => {
    Given(
      "the meeting range is 09:00–11:00 in Almaty on 2026-03-08",
      openSample,
    );
    When("the end handle is dragged to the position of 07:40", () => {
      range = getMeetingRangeAtHandleMinutes(
        referenceDay(),
        range,
        MeetingHandle.END,
        DRAGGED_MINUTES,
      );
    });
    Then("the meeting range is 09:00–09:15", () => {
      expect(spanIn(range, ALMATY_ZONE)).toBe("09:00–09:15");
    });
  });
});
