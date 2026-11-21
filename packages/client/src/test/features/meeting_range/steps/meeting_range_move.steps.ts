// Verifies FR14, FR20 of move-meeting-range-and-extend-past-midnight.
import type { FeatureDescriibeCallbackParams } from "@amiceli/vitest-cucumber";
import { describeFeature, loadFeature } from "@amiceli/vitest-cucumber";
import { expect } from "vitest";
import {
  MILLISECONDS_PER_MINUTE,
  MINUTES_PER_DAY,
  MINUTES_PER_HOUR,
} from "@/constants";
import { Temporal } from "@/lib/temporal";
import { LocationCommandType, type MeetingRange, TrackMove } from "@/model";
import { createMeetingWorld, NEXT_DAY_SUFFIX } from "./meetingRangeWorld";

const feature = await loadFeature("../meeting_range_move.feature");

const MOVES: Record<string, TrackMove> = {
  "next step": TrackMove.NEXT_STEP,
  "previous step": TrackMove.PREVIOUS_STEP,
  "an hour forward": TrackMove.HOUR_FORWARD,
  "an hour back": TrackMove.HOUR_BACK,
  "day start": TrackMove.DAY_START,
  "day end": TrackMove.DAY_END,
};
const SPAN_PATTERN = /^(\d{2}):(\d{2})–(\d{2}):(\d{2})/;
const SAMPLE_DATE = "2026-03-08";
const ALMATY_OFFSET_HOURS = 5;
const NEW_YORK_ZONE = "America/New_York";
const BEFORE_DAY_START_TEXT = "an hour before the start of the reference day";
const NEW_YORK_DAY_START = "2026-03-08T05:00:00Z";
const NEW_YORK_FIRST_START_OFFSET_MINUTES = 30;
const SAMPLE_LENGTH_MINUTES = 120;
const TWICE = 2;

/** "09:05–09:28[ of the next day]" in Almaty on the sample date as instants. */
const rangeOfSpan = (span: string): MeetingRange => {
  const [, startHour, startMinute, endHour, endMinute] = span.match(
    SPAN_PATTERN,
  ) as RegExpMatchArray;
  const at = (hour: string, minute: string) =>
    Temporal.Instant.from(`${SAMPLE_DATE}T${hour}:${minute}:00Z`).subtract({
      hours: ALMATY_OFFSET_HOURS,
    });
  const end = at(endHour, endMinute);
  return {
    start: at(startHour, startMinute),
    end: span.endsWith(NEXT_DAY_SUFFIX)
      ? end.add({ minutes: MINUTES_PER_DAY })
      : end,
  };
};
const minutesOfClock = (clockText: string) => {
  const [hour, minute] = clockText.split(":").map(Number);
  return hour * MINUTES_PER_HOUR + minute;
};

describeFeature(feature, (f: FeatureDescriibeCallbackParams) => {
  const world = createMeetingWorld();
  const openWithSpan = (span: string) => {
    world.open();
    const { start, end } = rangeOfSpan(span);
    world.setRange(start.toString(), end.toString());
  };
  const move = (target: Parameters<typeof world.dispatch>[0]) => {
    world.dispatch(target);
  };
  const minutesLong = () => {
    const meeting = world.state().meeting as MeetingRange;
    return (
      (meeting.end.epochMilliseconds - meeting.start.epochMilliseconds) /
      MILLISECONDS_PER_MINUTE
    );
  };

  // @move-meeting-range-and-extend-past-midnight @FR14
  f.ScenarioOutline(
    "Moves of the sample meeting",
    ({ Given, When, Then, And }, variables) => {
      Given(
        'the reference zone is "Asia/Almaty" and the meeting range is 09:00–11:00 on 2026-03-08',
        () => world.openWithSampleMeeting(),
      );
      When("the meeting range makes the move <move>", () =>
        move({
          type: LocationCommandType.MOVE_MEETING_RANGE,
          target: { move: MOVES[variables.move] },
        }),
      );
      Then("the meeting range is <range>, 120 minutes long", () => {
        world.expectSpan(variables.range);
        expect(minutesLong()).toBe(SAMPLE_LENGTH_MINUTES);
      });
      And("the reference moment is pinned at its start", () =>
        world.expectPinnedAt(world.state().meeting?.start.toString() ?? ""),
      );
    },
  );

  // @move-meeting-range-and-extend-past-midnight @FR14
  f.ScenarioOutline(
    "Moves of a meeting off the track step",
    ({ Given, When, Then }, variables) => {
      Given(
        'the reference zone is "Asia/Almaty" and the meeting range is 09:05–09:28 on 2026-03-08',
        () => openWithSpan("09:05–09:28"),
      );
      When("the meeting range makes the move <move>", () =>
        move({
          type: LocationCommandType.MOVE_MEETING_RANGE,
          target: { move: MOVES[variables.move] },
        }),
      );
      Then("the meeting range is <range>, 23 minutes long", () => {
        world.expectSpan(variables.range);
        expect(minutesLong()).toBe(23);
      });
    },
  );

  // @move-meeting-range-and-extend-past-midnight @FR20
  f.ScenarioOutline(
    "A pointer position lands the start on the track step",
    ({ Given, When, Then }, variables) => {
      Given("the meeting range is 13:00–15:00 in Almaty on 2026-03-08", () =>
        openWithSpan("13:00–15:00"),
      );
      When(
        "the meeting range is moved so that its start is at the position of <position>",
        () => {
          const startMinutes =
            variables.position === BEFORE_DAY_START_TEXT
              ? -MINUTES_PER_HOUR
              : minutesOfClock(variables.position);
          move({
            type: LocationCommandType.MOVE_MEETING_RANGE,
            target: { startMinutes },
          });
        },
      );
      Then("the meeting range is <range>", () =>
        world.expectSpan(variables.range),
      );
    },
  );

  // @move-meeting-range-and-extend-past-midnight @FR14
  f.ScenarioOutline(
    "A move stops at the limits",
    ({ Given, When, Then }, variables) => {
      Given("the meeting range is <before> in Almaty on 2026-03-08", () =>
        openWithSpan(variables.before),
      );
      When("the meeting range makes the move <move>", () =>
        move({
          type: LocationCommandType.MOVE_MEETING_RANGE,
          target: { move: MOVES[variables.move] },
        }),
      );
      Then("the meeting range is <range>", () =>
        world.expectSpan(variables.range),
      );
    },
  );

  // @move-meeting-range-and-extend-past-midnight @FR14
  f.Scenario(
    "A move on a clock change day keeps the length",
    ({ Given, When, Then }) => {
      Given(
        'the reference zone is "America/New_York" and the meeting range is 00:30–01:30 on 2026-03-08, a 23-hour day',
        () => {
          world.open({
            deviceZone: NEW_YORK_ZONE,
            cities: ["New York"],
            homeCity: "New York",
          });
          const start = Temporal.Instant.from(NEW_YORK_DAY_START).add({
            minutes: NEW_YORK_FIRST_START_OFFSET_MINUTES,
          });
          world.setRange(
            start.toString(),
            start.add({ minutes: MINUTES_PER_HOUR }).toString(),
          );
          expect(world.lastError()).toBeUndefined();
        },
      );
      When('the meeting range makes the move "an hour forward" twice', () => {
        for (let step = 0; step < TWICE; step += 1) {
          move({
            type: LocationCommandType.MOVE_MEETING_RANGE,
            target: { move: TrackMove.HOUR_FORWARD },
          });
        }
      });
      Then(
        "the meeting range is 60 minutes long and starts 120 minutes of absolute time later",
        () => {
          const meeting = world.state().meeting as MeetingRange;
          const firstStart = Temporal.Instant.from(NEW_YORK_DAY_START).add({
            minutes: NEW_YORK_FIRST_START_OFFSET_MINUTES,
          });
          expect(minutesLong()).toBe(MINUTES_PER_HOUR);
          expect(
            (meeting.start.epochMilliseconds - firstStart.epochMilliseconds) /
              MILLISECONDS_PER_MINUTE,
          ).toBe(TWICE * MINUTES_PER_HOUR);
        },
      );
    },
  );

  // @move-meeting-range-and-extend-past-midnight @FR14
  f.Scenario("No meeting range", ({ Given, When, Then }) => {
    Given("no meeting range is set", () => {
      world.open();
    });
    When("a move of the meeting range is asked for", () =>
      move({
        type: LocationCommandType.MOVE_MEETING_RANGE,
        target: { move: TrackMove.NEXT_STEP },
      }),
    );
    Then("the state is unchanged", () => world.expectStateUnchanged());
  });
});
