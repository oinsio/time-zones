// Verifies FR1, FR2, FR4, FR5, FR11 of move-meeting-range-and-extend-past-midnight.
import type { FeatureDescriibeCallbackParams } from "@amiceli/vitest-cucumber";
import { describeFeature, loadFeature } from "@amiceli/vitest-cucumber";
import { expect } from "vitest";
import {
  MILLISECONDS_PER_MINUTE,
  MINUTES_PER_DAY,
  MINUTES_PER_HOUR,
} from "@/constants";
import { Temporal } from "@/lib/temporal";
import {
  getMeetingRangeAfterHandleMove,
  getMeetingRangeAtHandleMinutes,
  getReferenceDay,
  LocationCommandType,
  type MeetingEndHandle,
  MeetingHandle,
  type MeetingRange,
  TrackMove,
} from "@/model";
import {
  ALMATY_ZONE,
  createMeetingWorld,
  NEXT_DAY_SUFFIX,
  SAMPLE_NOW,
  spanIn,
} from "./meetingRangeWorld";

const feature = await loadFeature("../meeting_range_past_midnight.feature");

const HANDLES: Record<string, MeetingEndHandle> = {
  start: MeetingHandle.START,
  end: MeetingHandle.END,
};
const MOVES: Record<string, TrackMove> = {
  "next step": TrackMove.NEXT_STEP,
  "an hour back": TrackMove.HOUR_BACK,
  "day start": TrackMove.DAY_START,
  "day end": TrackMove.DAY_END,
};
const PAST_MIDNIGHT_SAMPLE = "23:00–02:00 of the next day";
const PAST_MIDNIGHT_START = "2026-03-08T18:00:00Z";
const PAST_MIDNIGHT_END = "2026-03-08T21:00:00Z";
const EVENING_START = "2026-03-08T17:00:00Z";
const EVENING_END = "2026-03-08T18:00:00Z";
const DRAGGED_MINUTES = MINUTES_PER_DAY + 40;
const NEXT_DATE = "2026-03-09";
const SAMPLE_DATE = "2026-03-08";

describeFeature(feature, (f: FeatureDescriibeCallbackParams) => {
  const world = createMeetingWorld();
  let range: MeetingRange;
  const referenceDay = () =>
    getReferenceDay(world.state(), Temporal.Instant.from(SAMPLE_NOW));
  const minutesLong = (meeting: MeetingRange) =>
    (meeting.end.epochMilliseconds - meeting.start.epochMilliseconds) /
    MILLISECONDS_PER_MINUTE;
  const openWith = (start: string, end: string) => {
    world.open();
    world.setRange(start, end);
    range = world.state().meeting as MeetingRange;
  };

  // @move-meeting-range-and-extend-past-midnight @FR1 @FR11
  f.ScenarioOutline(
    "A meeting past midnight of the reference zone",
    ({ Given, When, Then, And }, variables) => {
      Given(
        'the reference zone is "Asia/Almaty" and the current time is "2026-03-08T07:30:00Z", live',
        () => world.open(),
      );
      When('the meeting range is set from "<start>" to "<end>"', () => {
        world.setRange(variables.start, variables.end);
      });
      Then(
        'the meeting range is "<range>" in Almaty, <minutes> minutes long',
        () => {
          world.expectSpan(variables.range);
          expect(minutesLong(world.state().meeting as MeetingRange)).toBe(
            Number(variables.minutes),
          );
        },
      );
      And("the reference day is 2026-03-08", () =>
        expect(
          referenceDay()
            .start.toZonedDateTimeISO(ALMATY_ZONE)
            .toPlainDate()
            .toString(),
        ).toBe(SAMPLE_DATE),
      );
    },
  );

  // @move-meeting-range-and-extend-past-midnight @FR2
  f.Scenario(
    "Set a meeting that ends after midnight",
    ({ Given, When, Then, And }) => {
      Given(
        'the reference zone is "Asia/Almaty" and the current time is "2026-03-08T07:30:00Z", live',
        () => world.open(),
      );
      When(
        'the meeting range is set from "2026-03-08T18:00:00Z" to "2026-03-08T21:00:00Z"',
        () => {
          world.setRange(PAST_MIDNIGHT_START, PAST_MIDNIGHT_END);
        },
      );
      Then(
        'the meeting range is "23:00–02:00 of the next day" in Almaty, 180 minutes long',
        () => world.expectSpan(PAST_MIDNIGHT_SAMPLE),
      );
      And('the reference moment is pinned at "2026-03-08T18:00:00Z"', () =>
        world.expectPinnedAt(PAST_MIDNIGHT_START),
      );
    },
  );

  // @move-meeting-range-and-extend-past-midnight @FR4
  f.ScenarioOutline(
    "Handles of a meeting past midnight",
    ({ Given, When, Then }, variables) => {
      Given(
        'the reference zone is "Asia/Almaty" and the meeting range is 23:00–02:00 of the next day',
        () => openWith(PAST_MIDNIGHT_START, PAST_MIDNIGHT_END),
      );
      When("the <handle> handle makes the move <move>", () => {
        range = getMeetingRangeAfterHandleMove(
          referenceDay(),
          range,
          HANDLES[variables.handle],
          MOVES[variables.move],
        );
      });
      Then("the meeting range is <range>", () =>
        expect(spanIn(range, ALMATY_ZONE)).toBe(variables.range),
      );
    },
  );

  // @move-meeting-range-and-extend-past-midnight @FR4
  f.Scenario(
    "The end handle is dragged past midnight",
    ({ Given, When, Then }) => {
      Given(
        'the reference zone is "Asia/Almaty" and the meeting range is 22:00–23:00',
        () => openWith(EVENING_START, EVENING_END),
      );
      When(
        "the end handle is dragged to 40 minutes after midnight of the next day",
        () => {
          range = getMeetingRangeAtHandleMinutes(
            referenceDay(),
            range,
            MeetingHandle.END,
            DRAGGED_MINUTES,
          );
        },
      );
      Then("the meeting range is 22:00–00:45 of the next day", () =>
        expect(spanIn(range, ALMATY_ZONE)).toBe(
          `22:00–00:45${NEXT_DAY_SUFFIX}`,
        ),
      );
    },
  );

  // @move-meeting-range-and-extend-past-midnight @FR5
  f.Scenario(
    "Next day keeps a meeting past midnight",
    ({ Given, When, Then }) => {
      Given(
        'the reference zone is "Asia/Almaty" and the meeting range is 23:00–02:00 of the next day',
        () => openWith(PAST_MIDNIGHT_START, PAST_MIDNIGHT_END),
      );
      When("the user selects the next day in the date bar", () => {
        world.dispatch({
          type: LocationCommandType.SHIFT_DATE,
          days: 1,
          now: SAMPLE_NOW,
        });
      });
      Then(
        "the meeting range is 23:00–02:00 of the next day starting on 2026-03-09",
        () => {
          world.expectSpan(PAST_MIDNIGHT_SAMPLE);
          const meeting = world.state().meeting as MeetingRange;
          expect(
            meeting.start
              .toZonedDateTimeISO(ALMATY_ZONE)
              .toPlainDate()
              .toString(),
          ).toBe(NEXT_DATE);
          expect(minutesLong(meeting)).toBe(3 * MINUTES_PER_HOUR);
        },
      );
    },
  );
});
