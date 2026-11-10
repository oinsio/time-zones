// Verifies FR1, FR2, FR3, FR4 of add-grid-meeting-range-and-share.
import type { FeatureDescriibeCallbackParams } from "@amiceli/vitest-cucumber";
import { describeFeature, loadFeature } from "@amiceli/vitest-cucumber";
import { act, cleanup, renderHook } from "@testing-library/react/pure";
import { createElement, type ReactNode } from "react";
import { expect } from "vitest";
import {
  createInMemoryLocationBackend,
  createInMemoryLocationRepository,
} from "@/adapters";
import { LocationsProvider, useLocations, useMeetingRange } from "@/controller";
import { Temporal } from "@/lib/temporal";
import {
  LocationCommandType,
  LocationErrorCode,
  ReferenceMode,
  WallTimeTargetKind,
} from "@/model";
import { LocationsLoadStatus } from "@/ports";
import { buildLocation, KNOWN_CITIES } from "@/test/factories/buildLocation";
import { createSwitchableClock } from "@/test/switchableClock";
import { createManualTickScheduler } from "@/test/tickSchedulers";
import { immediateWriteScheduler } from "@/test/writeSchedulers";
import {
  ALMATY_ZONE,
  createMeetingWorld,
  idOf,
  SAMPLE_END,
  SAMPLE_NOW,
  SAMPLE_START,
} from "./meetingRangeWorld";

const feature = await loadFeature("../meeting_range_commands.feature");

const NEW_YORK_ZONE = "America/New_York";
const RETURN_TO_NOW = "returns to now";
const SELECT_TIME = "selects a time on a day track or an hour strip";
const TYPE_TIME = "types 12:15 into the time of Almaty";

describeFeature(feature, (f: FeatureDescriibeCallbackParams) => {
  const world = createMeetingWorld();

  f.AfterEachScenario(() => cleanup());

  // @add-grid-meeting-range-and-share @FR1
  f.Scenario(
    "A stored list never carries a meeting range",
    ({ Given, When, Then, And }) => {
      const backend = createInMemoryLocationBackend();
      const renderApp = () =>
        renderHook(
          () => ({ meeting: useMeetingRange(), locations: useLocations() }),
          {
            wrapper: ({ children }: { children?: ReactNode }) =>
              createElement(
                LocationsProvider,
                {
                  repository: createInMemoryLocationRepository({ backend }),
                  writeScheduler: immediateWriteScheduler,
                  clock: createSwitchableClock(SAMPLE_NOW, ALMATY_ZONE),
                  tickScheduler: createManualTickScheduler(),
                },
                children,
              ),
          },
        );
      let app: ReturnType<typeof renderApp>;
      Given(
        "the reference zone is {string} and the meeting range is 09:00–11:00 on 2026-03-08",
        () => {
          backend.document = {
            status: LocationsLoadStatus.LOADED,
            locations: [
              buildLocation({ label: "Almaty", ...KNOWN_CITIES.Almaty }),
            ],
            homeLocationId: idOf("Almaty"),
          };
          app = renderApp();
          act(() => app.result.current.meeting.selectCells(9, 10));
          expect(app.result.current.meeting.meeting).toBeDefined();
        },
      );
      When(
        "the location list is written to storage and the app is opened again",
        () => {
          act(() => {
            app.result.current.locations.addLocation({
              timeZoneId: "Europe/Moscow",
              label: "Moscow",
              countryCode: "RU",
            });
          });
          app.unmount();
          app = renderApp();
        },
      );
      Then("the stored document has no meeting range", () => {
        expect(backend.document.status).toBe(LocationsLoadStatus.LOADED);
        expect(Object.keys(backend.document)).not.toContain("meeting");
        expect(JSON.stringify(backend.document)).not.toContain("meeting");
      });
      And("the app opens live without a meeting range", () => {
        expect(app.result.current.meeting.meeting).toBeUndefined();
      });
    },
  );

  // @add-grid-meeting-range-and-share @FR2
  f.Scenario("Set a two-hour meeting", ({ Given, When, Then, And }) => {
    Given(
      "the reference zone is {string} and the current time is {string}, live",
      (_ctx, zone: string) => world.open({ deviceZone: zone }),
    );
    When(
      "the meeting range is set from {string} to {string}",
      (_ctx, start: string, end: string) => {
        world.setRange(start, end);
      },
    );
    Then("the meeting range is 09:00–11:00 in Almaty", () =>
      world.expectSpan("09:00–11:00"),
    );
    And("the reference moment is pinned at {string}", (_ctx, instant: string) =>
      world.expectPinnedAt(instant),
    );
  });

  // @add-grid-meeting-range-and-share @FR2
  f.ScenarioOutline(
    "Invalid ranges are refused",
    ({ Given, When, Then, And }, variables) => {
      Given(
        "the reference zone is {string}, the current time is {string} and no meeting range is set",
        (_ctx, zone: string) => world.open({ deviceZone: zone }),
      );
      When('the meeting range is set from "<start>" to "<end>"', () => {
        world.setRange(variables.start, variables.end);
      });
      Then("the command fails with INVALID_MEETING_RANGE", () =>
        expect(world.lastError()).toBe(LocationErrorCode.INVALID_MEETING_RANGE),
      );
      And("the state is unchanged", () => world.expectStateUnchanged());
    },
  );

  // @add-grid-meeting-range-and-share @FR2
  f.Scenario("Clear keeps the moment pinned", ({ Given, When, Then, And }) => {
    Given("the meeting range is 09:00–11:00 in Almaty on 2026-03-08", () =>
      world.openWithSampleMeeting(),
    );
    When("the meeting range is cleared", () => {
      world.dispatch({ type: LocationCommandType.CLEAR_MEETING_RANGE });
    });
    Then("no meeting range is set", () => world.expectNoRange());
    And("the reference moment is pinned at 09:00 in Almaty", () =>
      world.expectPinnedAt(SAMPLE_START),
    );
  });

  // @add-grid-meeting-range-and-share @FR3
  f.ScenarioOutline(
    "Commands that remove the range",
    ({ Given, When, Then }, variables) => {
      Given("the meeting range is 09:00–11:00 in Almaty on 2026-03-08", () =>
        world.openWithSampleMeeting(),
      );
      When("the user <does>", () => {
        const commands = {
          [RETURN_TO_NOW]: { type: LocationCommandType.RESET_TO_NOW },
          [SELECT_TIME]: {
            type: LocationCommandType.SELECT_INSTANT,
            instant: "2026-03-08T08:00:00Z",
          },
          [TYPE_TIME]: {
            type: LocationCommandType.SET_WALL_TIME,
            target: {
              kind: WallTimeTargetKind.LOCATION,
              locationId: idOf("Almaty"),
            },
            time: "12:15",
            date: "2026-03-08",
          },
        } as const;
        world.dispatch(commands[variables.does as keyof typeof commands]);
      });
      Then("no meeting range is set", () => world.expectNoRange());
    },
  );

  // @add-grid-meeting-range-and-share @FR3
  f.Scenario("Next day keeps the meeting", ({ Given, When, Then }) => {
    Given("the meeting range is 09:00–11:00 in Almaty on 2026-03-08", () =>
      world.openWithSampleMeeting(),
    );
    When("the user selects the next day in the date bar", () => {
      world.dispatch({
        type: LocationCommandType.SHIFT_DATE,
        days: 1,
        now: SAMPLE_NOW,
      });
    });
    Then("the meeting range is 09:00–11:00 in Almaty on 2026-03-09", () => {
      world.expectSpan("09:00–11:00");
      expect(
        world
          .state()
          .meeting?.start.toZonedDateTimeISO(ALMATY_ZONE)
          .toPlainDate()
          .toString(),
      ).toBe("2026-03-09");
    });
  });

  // @add-grid-meeting-range-and-share @FR3
  f.Scenario("A shorter day clamps the end", ({ Given, When, Then }) => {
    Given(
      "the reference zone is {string} and the meeting range is the whole reference day of 2026-03-07, 24 hours long",
      (_ctx, zone: string) => {
        expect(zone).toBe(NEW_YORK_ZONE);
        world.open({
          deviceZone: zone,
          cities: ["New York"],
          homeCity: "New York",
        });
        world.setRange("2026-03-07T05:00:00Z", "2026-03-08T05:00:00Z");
        expect(world.lastError()).toBeUndefined();
      },
    );
    When("the user selects the next day in the date bar", () => {
      world.dispatch({
        type: LocationCommandType.SHIFT_DATE,
        days: 1,
        now: SAMPLE_NOW,
      });
    });
    Then(
      "the meeting range starts at 00:00 on 2026-03-08 and ends at the end of that 23-hour day, 23 hours long",
      () => {
        const meeting = world.state().meeting;
        expect(meeting?.start.toString()).toBe("2026-03-08T05:00:00Z");
        expect(meeting?.end.toString()).toBe("2026-03-09T04:00:00Z");
        expect(meeting?.end.since(meeting.start).total({ unit: "hour" })).toBe(
          23,
        );
      },
    );
  });

  // @add-grid-meeting-range-and-share @FR4
  f.Scenario("Another home removes the range", ({ Given, When, Then, And }) => {
    Given(
      "the home location is Almaty and the meeting range is 09:00–11:00 in Almaty on 2026-03-08",
      () => world.openWithSampleMeeting({ homeCity: "Almaty" }),
    );
    When("the user makes Moscow the home location", () => {
      world.dispatch({
        type: LocationCommandType.SET_HOME_LOCATION,
        id: idOf("Moscow"),
      });
    });
    Then("no meeting range is set", () => world.expectNoRange());
    And(
      "the reference moment is pinned at {string}",
      (_ctx, instant: string) => {
        expect(world.state().reference.mode).toBe(ReferenceMode.PINNED);
        world.expectPinnedAt(instant);
      },
    );
  });

  // @add-grid-meeting-range-and-share @FR4
  f.Scenario(
    "Removing the last location removes the range",
    ({ Given, When, Then }) => {
      Given(
        "the list holds only Almaty and the meeting range is 09:00–11:00",
        () => world.openWithSampleMeeting({ cities: ["Almaty"] }),
      );
      When("the user removes Almaty", () => {
        world.dispatch({
          type: LocationCommandType.REMOVE_LOCATION,
          id: idOf("Almaty"),
        });
      });
      Then("no meeting range is set", () => world.expectNoRange());
    },
  );

  // @add-grid-meeting-range-and-share @FR4
  f.Scenario("Adding a location keeps the range", ({ Given, When, Then }) => {
    Given("the meeting range is 09:00–11:00 in Almaty on 2026-03-08", () =>
      world.openWithSampleMeeting(),
    );
    When("the user adds Tokyo", () => {
      world.dispatch({
        type: LocationCommandType.ADD_LOCATION,
        timeZoneId: "Asia/Tokyo",
        label: "Tokyo",
        countryCode: "JP",
      });
    });
    Then("the meeting range is still 09:00–11:00 in Almaty", () => {
      world.expectSpan("09:00–11:00");
      expect(world.state().meeting?.start.toString()).toBe(
        Temporal.Instant.from(SAMPLE_START).toString(),
      );
      expect(world.state().meeting?.end.toString()).toBe(SAMPLE_END);
    });
  });
});
