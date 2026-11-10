// Verifies FR5 of fix-grid-meeting-range-lock-and-layering.
import type { FeatureDescriibeCallbackParams } from "@amiceli/vitest-cucumber";
import { describeFeature, loadFeature } from "@amiceli/vitest-cucumber";
import { expect } from "vitest";
import { LocationCommandType, WallTimeTargetKind } from "@/model";
import { createMeetingWorld, idOf, SAMPLE_START } from "./meetingRangeWorld";

const feature = await loadFeature("../meeting_range_wall_times.feature");

describeFeature(feature, (f: FeatureDescriibeCallbackParams) => {
  const world = createMeetingWorld();
  const setFromWallTimes = (
    city: string,
    date: string,
    start: string,
    end: string,
  ) => {
    const known = world.state().locations.some((l) => l.label === city);
    world.dispatch({
      type: LocationCommandType.SET_MEETING_RANGE_WALL_TIMES,
      target: {
        kind: WallTimeTargetKind.LOCATION,
        locationId: known ? idOf(city) : `unknown|${city}`,
      },
      date,
      start,
      end,
    });
  };

  // @fix-grid-meeting-range-lock-and-layering @FR5
  f.ScenarioOutline(
    "Wall-clock times of any location set the range",
    ({ Given, When, Then, And }, variables) => {
      Given(
        'the reference zone is "Asia/Almaty", the current time is "2026-03-08T07:30:00Z" and the list holds Almaty, Moscow, Kolkata and New York',
        () => world.open(),
      );
      When(
        'the meeting range is set from "<start>" to "<end>" in "<city>" on "<date>"',
        () =>
          setFromWallTimes(
            variables.city,
            variables.date,
            variables.start,
            variables.end,
          ),
      );
      Then('the meeting range is "<range>" in Almaty on 2026-03-08', () =>
        world.expectSpan(variables.range),
      );
      And("the reference moment is pinned at its start", () =>
        world.expectPinnedAt(world.state().meeting?.start.toString() ?? ""),
      );
    },
  );

  // @fix-grid-meeting-range-lock-and-layering @FR5
  f.ScenarioOutline(
    "Times that break the invariants are refused",
    ({ Given, When, Then, And }, variables) => {
      Given(
        'the reference zone is "Asia/Almaty", the current time is "2026-03-08T07:30:00Z" and the meeting range is 09:00–11:00 in Almaty',
        () => world.openWithSampleMeeting(),
      );
      When(
        'the meeting range is set from "<start>" to "<end>" in "<city>" on "<date>"',
        () =>
          setFromWallTimes(
            variables.city,
            variables.date,
            variables.start,
            variables.end,
          ),
      );
      Then('the command fails with "<error>"', () =>
        expect(world.lastError()).toBe(variables.error),
      );
      And("the state is unchanged", () => {
        world.expectStateUnchanged();
        world.expectPinnedAt(SAMPLE_START);
      });
    },
  );

  // @fix-grid-meeting-range-lock-and-layering @FR5
  f.Scenario("The whole reference day", ({ Given, When, Then }) => {
    Given(
      'the reference zone is "Asia/Almaty" and the current time is "2026-03-08T07:30:00Z"',
      () => world.open(),
    );
    When(
      'the meeting range is set from "00:00" to "00:00" in "Almaty" on "2026-03-08"',
      () => setFromWallTimes("Almaty", "2026-03-08", "00:00", "00:00"),
    );
    Then(
      'the meeting range is the whole reference day, from "2026-03-07T19:00:00Z" to "2026-03-08T19:00:00Z"',
      () => {
        expect(world.state().meeting?.start.toString()).toBe(
          "2026-03-07T19:00:00Z",
        );
        expect(world.state().meeting?.end.toString()).toBe(
          "2026-03-08T19:00:00Z",
        );
      },
    );
  });
});
