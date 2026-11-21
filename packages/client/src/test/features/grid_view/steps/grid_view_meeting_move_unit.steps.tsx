// Verifies FR16, FR19, FR20, NFR-P1, UX3 of move-meeting-range-and-extend-past-midnight.
import type { FeatureDescriibeCallbackParams } from "@amiceli/vitest-cucumber";
import { describeFeature, loadFeature } from "@amiceli/vitest-cucumber";
import { act, fireEvent, screen } from "@testing-library/react/pure";
import i18n from "i18next";
import { expect, vi } from "vitest";
import { HourGridCssVariable, MEETING_FRAME_SELECTOR } from "@/constants";
import { Temporal } from "@/lib/temporal";
import {
  getMeetingRangeAfterMove,
  getReferenceDay,
  getZoneCoordinates,
  INITIAL_WORLD_CLOCK_STATE,
  type MeetingRange,
  TrackMove,
} from "@/model";
import { HourFormat } from "@/preferences";
import {
  type PresentedHourStrip,
  presentHourStrip,
  presentLocationMeetingRange,
} from "@/presenter";
import { TIME_OF_DAY_CONTEXT } from "@/test/dayColouringContext";
import { KNOWN_CITIES } from "@/test/factories/buildLocation";
import { startWorkCount, type WorkCount } from "@/test/workCounters";
import {
  HOUR_STRIP_BUDGET_ROW_COUNT,
  HOUR_STRIP_BUDGET_ZONES,
} from "./hourStripBudgetWorld";
import {
  meetingTitle,
  pressOnHandle,
  spanOf,
  stripOf,
  tapColumn,
} from "./meetingGridQueries";
import { createMeetingGridSession } from "./meetingGridSession";

const feature = await loadFeature("../grid_view_meeting_move_unit.feature");

const STRIP_LEFT_PX = 16;
const MOUSE = "mouse";
const FIRST_FRAME_COLUMN = 13;
const LONG_LIST_LOCATION_COUNT = 12;
const LONG_LIST = Object.keys(KNOWN_CITIES).slice(0, LONG_LIST_LOCATION_COUNT);
const REFERENCE_ZONE = "Asia/Almaty";
const SAMPLE_INSTANT = "2026-03-08T07:30:00Z";
const HALF_CELL = 0.5;
const ONE_AND_A_HALF_CELLS = 1.5;
const MOVE_HANDLE_NAME = "Move meeting";
const MEETING: MeetingRange = {
  start: Temporal.Instant.from("2026-03-08T04:00:00Z"),
  end: Temporal.Instant.from("2026-03-08T06:00:00Z"),
};
const day = getReferenceDay(
  { ...INITIAL_WORLD_CLOCK_STATE, deviceTimeZoneId: REFERENCE_ZONE },
  Temporal.Instant.from(SAMPLE_INSTANT),
);

const presentRows = (meeting: MeetingRange): PresentedHourStrip[] =>
  Array.from({ length: HOUR_STRIP_BUDGET_ROW_COUNT }, (_, row) => {
    const zone = HOUR_STRIP_BUDGET_ZONES[row % HOUR_STRIP_BUDGET_ZONES.length];
    presentLocationMeetingRange(zone, meeting, REFERENCE_ZONE, {
      language: "en",
      hourFormat: HourFormat.H24,
      ...TIME_OF_DAY_CONTEXT,
      translate: i18n.getFixedT("en"),
    });
    return presentHourStrip(zone, {
      day,
      coordinates: getZoneCoordinates(zone),
      referenceZoneId: REFERENCE_ZONE,
      language: "en",
      hourFormat: HourFormat.H24,
      ...TIME_OF_DAY_CONTEXT,
    });
  });

describeFeature(feature, (f: FeatureDescriibeCallbackParams) => {
  const session = createMeetingGridSession();
  let frameReads = 0;
  let frameCallbacks: FrameRequestCallback[] = [];
  let firstStrips: PresentedHourStrip[] = [];
  let laterStrips: PresentedHourStrip[] = [];
  let workCount: WorkCount | undefined;

  const installGeometry = () => {
    vi.spyOn(Element.prototype, "getBoundingClientRect").mockImplementation(
      function (this: Element) {
        if (this.hasAttribute("data-hour-strip")) {
          return { left: STRIP_LEFT_PX, top: 0, height: 38 } as DOMRect;
        }
        if (this.matches(MEETING_FRAME_SELECTOR)) {
          frameReads += 1;
          return { left: 100, width: 80, top: 100 } as DOMRect;
        }
        return {
          left: 0,
          right: 390,
          top: 0,
          bottom: 0,
          height: 400,
        } as DOMRect;
      },
    );
    vi.spyOn(window, "requestAnimationFrame").mockImplementation((callback) => {
      frameCallbacks.push(callback);
      return frameCallbacks.length;
    });
  };
  const cellPitchPx = () =>
    Number.parseFloat(
      (
        document
          .querySelector("[data-hour-strip]")
          ?.parentElement?.closest("ul")?.style ?? document.body.style
      ).getPropertyValue(HourGridCssVariable.CELL_PITCH),
    );
  const xOfColumn = (column: number) =>
    STRIP_LEFT_PX + (column + HALF_CELL) * cellPitchPx();
  const openWithMeeting = async (cities?: string[]) => {
    installGeometry();
    await session.openGrid(cities);
    tapColumn("Almaty", FIRST_FRAME_COLUMN);
    pressOnHandle("endHandle", "PageUp");
  };

  f.BeforeEachScenario(async () => {
    frameReads = 0;
    frameCallbacks = [];
    await session.reset();
  });
  f.AfterAllScenarios(session.world.finish);
  f.AfterEachScenario(() => {
    workCount?.stop();
    vi.restoreAllMocks();
  });

  // @move-meeting-range-and-extend-past-midnight @FR16
  f.Scenario(
    "A click inside the frame is still a tap",
    ({ Given, When, Then }) => {
      Given("the Grid view with the meeting range 13:00–15:00 in Almaty", () =>
        openWithMeeting(),
      );
      When(
        "the user clicks column 14 of Almaty without moving the mouse",
        () => {
          const strip = stripOf("Almaty");
          fireEvent.pointerDown(strip, {
            pointerType: MOUSE,
            clientX: xOfColumn(FIRST_FRAME_COLUMN + 1),
          });
          fireEvent.pointerUp(strip, { pointerType: MOUSE });
          tapColumn("Almaty", FIRST_FRAME_COLUMN + 1);
        },
      );
      Then("the meeting range is 14:00–15:00", () =>
        expect(spanOf("Almaty")).toBe("14:00–15:00"),
      );
    },
  );

  // @move-meeting-range-and-extend-past-midnight @FR16
  f.Scenario(
    "A press outside the frame sets a new range",
    ({ Given, When, Then }) => {
      Given("the Grid view with the meeting range 13:00–15:00 in Almaty", () =>
        openWithMeeting(),
      );
      When(
        "the user drags with the mouse from column 9 to column 10 of Almaty",
        () => {
          const strip = stripOf("Almaty");
          fireEvent.pointerDown(strip, {
            pointerType: MOUSE,
            clientX: xOfColumn(9),
          });
          fireEvent.pointerMove(strip, {
            pointerType: MOUSE,
            clientX: xOfColumn(10),
          });
          fireEvent.pointerUp(strip, { pointerType: MOUSE });
        },
      );
      Then("the meeting range is 09:00–11:00", () =>
        expect(spanOf("Almaty")).toBe("09:00–11:00"),
      );
    },
  );

  // @move-meeting-range-and-extend-past-midnight @FR19 @FR20 @UX3
  f.Scenario("Rows follow the move", ({ Given, When, Then, And }) => {
    Given(
      "the Grid view with Almaty, Moscow, Kolkata and New York and the meeting range 13:00–15:00 in Almaty on 2026-03-08",
      () => openWithMeeting(),
    );
    When(
      "the user holds the move handle one and a half cells to the right of its place",
      () => {
        const handle = screen.getByRole("slider", { name: MOVE_HANDLE_NAME });
        fireEvent.pointerDown(handle, { pointerType: MOUSE, clientX: 300 });
        fireEvent.pointerMove(handle, {
          pointerType: MOUSE,
          clientX: 300 + ONE_AND_A_HALF_CELLS * cellPitchPx(),
        });
      },
    );
    Then(
      'Almaty shows "14:30–16:30", Moscow "12:30–14:30", Kolkata "15:00–17:00" and New York "05:30–07:30"',
      () => {
        expect([
          spanOf("Almaty"),
          spanOf("Moscow"),
          spanOf("Kolkata"),
          spanOf("New York"),
        ]).toEqual([
          "14:30–16:30",
          "12:30–14:30",
          "15:00–17:00",
          "05:30–07:30",
        ]);
      },
    );
    And('the title is "Meeting · 2 h"', () =>
      expect(meetingTitle()).toHaveTextContent("Meeting · 2 h"),
    );
    And("the frame has its lifted look", () =>
      expect(document.querySelector(MEETING_FRAME_SELECTOR)).toHaveAttribute(
        "data-moving",
      ),
    );
  });

  // @move-meeting-range-and-extend-past-midnight @FR19
  f.Scenario("A release after a move is not a tap", ({ Given, When, Then }) => {
    Given("the Grid view with the meeting range 13:00–15:00 in Almaty", () =>
      openWithMeeting(),
    );
    When(
      "the user drags the frame one cell to the right and the browser then sends the click of that gesture to an hour cell of column 9",
      () => {
        const strip = stripOf("Almaty");
        const pressX = xOfColumn(FIRST_FRAME_COLUMN);
        fireEvent.pointerDown(strip, {
          pointerType: MOUSE,
          clientX: pressX,
        });
        fireEvent.pointerMove(strip, {
          pointerType: MOUSE,
          clientX: pressX + cellPitchPx(),
        });
        fireEvent.pointerUp(strip, { pointerType: MOUSE });
        tapColumn("Almaty", 9);
      },
    );
    Then("the meeting range is 14:00–16:00", () =>
      expect(spanOf("Almaty")).toBe("14:00–16:00"),
    );
  });

  // @move-meeting-range-and-extend-past-midnight @NFR-P1
  f.Scenario("A move step is bounded", ({ Given, When, Then, And }) => {
    Given(
      "the rows and hour strips of 50 locations in 10 zones were presented with the meeting range 09:00–11:00 on 2026-03-08",
      () => {
        firstStrips = presentRows(MEETING);
      },
    );
    When(
      "the meeting range moves one track step and the rows are presented again",
      () => {
        const moved = getMeetingRangeAfterMove(
          MEETING,
          day,
          TrackMove.NEXT_STEP,
        );
        workCount = startWorkCount();
        laterStrips = presentRows(moved);
        workCount.stop();
      },
    );
    Then(
      "no formatter is built and no time zone transition is looked up",
      () => {
        expect((workCount as WorkCount).formatters()).toBe(0);
        expect((workCount as WorkCount).transitionLookups()).toBe(0);
      },
    );
    And("every row gets the same hour strip as before", () => {
      laterStrips.forEach((strip, row) => {
        expect(strip).toBe(firstStrips[row]);
      });
    });
  });

  // @move-meeting-range-and-extend-past-midnight @NFR-P1
  f.Scenario(
    "Scrolling re-places the move handle cheaply",
    ({ Given, When, Then }) => {
      Given(
        "the Grid view with 12 locations and the meeting range 09:00–11:00 in Almaty",
        async () => {
          await openWithMeeting(LONG_LIST);
        },
      );
      When("three scroll events arrive before the next animation frame", () => {
        act(() => {
          frameCallbacks = [];
        });
        frameReads = 0;
        for (let event = 0; event < 3; event += 1) {
          act(() => {
            window.dispatchEvent(new Event("scroll"));
          });
        }
        act(() => {
          const pending = frameCallbacks;
          frameCallbacks = [];
          for (const callback of pending) callback(0);
        });
      });
      Then("the meeting frame is measured once for the move handle", () => {
        expect(frameReads).toBe(1);
      });
    },
  );
});
