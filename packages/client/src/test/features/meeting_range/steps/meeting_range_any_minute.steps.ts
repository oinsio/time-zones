// Verifies FR1, FR4, FR5 of refine-meeting-range-entry-and-handles.
import type { FeatureDescriibeCallbackParams } from "@amiceli/vitest-cucumber";
import { describeFeature, loadFeature } from "@amiceli/vitest-cucumber";
import { expect } from "vitest";
import { MILLISECONDS_PER_MINUTE, MINUTES_PER_HOUR } from "@/constants";
import { Temporal } from "@/lib/temporal";
import {
  getMeetingRangeAfterHandleMove,
  getMeetingRangeAtHandleMinutes,
  getReferenceDay,
  LocationCommandType,
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

const feature = await loadFeature("../meeting_range_any_minute.feature");

const HANDLES: Record<string, MeetingHandle> = {
  start: MeetingHandle.START,
  end: MeetingHandle.END,
};
const MOVES: Record<string, TrackMove> = {
  "next step": TrackMove.NEXT_STEP,
  "previous step": TrackMove.PREVIOUS_STEP,
  "an hour back": TrackMove.HOUR_BACK,
  "day start": TrackMove.DAY_START,
};
const SPAN_PATTERN = /^(\d{2}):(\d{2})–(\d{2}):(\d{2})$/;
const SAMPLE_DATE = "2026-03-08";
const ALMATY_OFFSET_HOURS = 5;

const rangeOfSpan = (date: string, span: string): MeetingRange => {
  const [, startHour, startMinute, endHour, endMinute] = span.match(
    SPAN_PATTERN,
  ) as RegExpMatchArray;
  const at = (hour: string, minute: string) =>
    Temporal.Instant.from(`${date}T${hour}:${minute}:00Z`).subtract({
      hours: ALMATY_OFFSET_HOURS,
    });
  return { start: at(startHour, startMinute), end: at(endHour, endMinute) };
};

describeFeature(feature, (f: FeatureDescriibeCallbackParams) => {
  const world = createMeetingWorld();
  let range: MeetingRange;
  const referenceDay = () =>
    getReferenceDay(world.state(), Temporal.Instant.from(SAMPLE_NOW));
  const openWithRange = (span: string) => {
    world.open();
    const { start, end } = rangeOfSpan(SAMPLE_DATE, span);
    world.setRange(start.toString(), end.toString());
    range = world.state().meeting as MeetingRange;
  };

  // @refine-meeting-range-entry-and-handles @FR1
  f.ScenarioOutline(
    "A meeting at any minute",
    ({ Given, When, Then }, variables) => {
      Given(
        'the reference zone is "Asia/Almaty" and the current time is "2026-03-08T07:30:00Z", live',
        () => world.open(),
      );
      When('the meeting range is set from "<start>" to "<end>"', () =>
        world.setRange(variables.start, variables.end),
      );
      Then(
        'the meeting range is "<range>" in Almaty, <minutes> minutes long',
        () => {
          world.expectSpan(variables.range, ALMATY_ZONE);
          const { start, end } = world.state().meeting as MeetingRange;
          expect(
            (end.epochMilliseconds - start.epochMilliseconds) /
              MILLISECONDS_PER_MINUTE,
          ).toBe(Number(variables.minutes));
        },
      );
    },
  );

  // @refine-meeting-range-entry-and-handles @FR5
  f.Scenario(
    "Next day keeps a meeting off the track step",
    ({ Given, When, Then }) => {
      Given("the meeting range is 09:05–09:28 in Almaty on 2026-03-08", () =>
        openWithRange("09:05–09:28"),
      );
      When("the user selects the next day in the date bar", () => {
        world.dispatch({
          type: LocationCommandType.SHIFT_DATE,
          days: 1,
          now: SAMPLE_NOW,
        });
      });
      Then("the meeting range is 09:05–09:28 in Almaty on 2026-03-09", () => {
        const { start, end } = world.state().meeting as MeetingRange;
        const expected = rangeOfSpan("2026-03-09", "09:05–09:28");
        expect(start.equals(expected.start)).toBe(true);
        expect(end.equals(expected.end)).toBe(true);
      });
    },
  );

  // @refine-meeting-range-entry-and-handles @FR4
  f.ScenarioOutline(
    "Moves from an end off the track step",
    ({ Given, When, Then }, variables) => {
      Given(
        'the reference zone is "Asia/Almaty" and the meeting range is "<before>" on 2026-03-08',
        () => openWithRange(variables.before),
      );
      When('the "<handle>" handle makes the move "<move>"', () => {
        range = getMeetingRangeAfterHandleMove(
          referenceDay(),
          range,
          HANDLES[variables.handle],
          MOVES[variables.move],
        );
      });
      Then('the meeting range is "<range>"', () => {
        expect(spanIn(range, ALMATY_ZONE)).toBe(variables.range);
      });
    },
  );

  // @refine-meeting-range-entry-and-handles @FR4
  f.Scenario(
    "A drag lands an off-step end on the track step",
    ({ Given, When, Then }) => {
      Given("the meeting range is 09:05–11:00 in Almaty on 2026-03-08", () =>
        openWithRange("09:05–11:00"),
      );
      When("the start handle is dragged to the position of 09:11", () => {
        range = getMeetingRangeAtHandleMinutes(
          referenceDay(),
          range,
          MeetingHandle.START,
          9 * MINUTES_PER_HOUR + 11,
        );
      });
      Then("the meeting range is 09:15–11:00", () => {
        expect(spanIn(range, ALMATY_ZONE)).toBe("09:15–11:00");
      });
    },
  );
});
