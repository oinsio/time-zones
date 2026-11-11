// Verifies FR7, FR8, NFR-P1 of refine-meeting-range-entry-and-handles.
import type { FeatureDescriibeCallbackParams } from "@amiceli/vitest-cucumber";
import { describeFeature, loadFeature } from "@amiceli/vitest-cucumber";
import { act, fireEvent, screen } from "@testing-library/react/pure";
import { expect, vi } from "vitest";
import { HourGridCssVariable } from "@/constants";
import { MeetingHandle } from "@/model";
import { KNOWN_CITIES } from "@/test/factories/buildLocation";
import { getMeetingHandleRow } from "@/views/grid/meetingHandleRow";
import {
  handleOf,
  setSampleMeeting,
  spanOf,
  tapColumn,
} from "./meetingGridQueries";
import { createMeetingGridSession } from "./meetingGridSession";

const pointerSupport = vi.hoisted(() => ({ isSupported: true }));
vi.mock("@/lib/legacy", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/legacy")>()),
  get IS_POINTER_EVENTS_SUPPORTED() {
    return pointerSupport.isSupported;
  },
}));

const feature = await loadFeature(
  "../grid_view_meeting_handle_reach_unit.feature",
);

const LOCATION_COUNT = 12;
const CITIES = Object.keys(KNOWN_CITIES).slice(0, LOCATION_COUNT);
const STRIP_LEFT_PX = 16;
const FIRST_STRIP_TOP_PX = 60;
const STRIP_HEIGHT_PX = 38;
const STRIP_PITCH_PX = 50;
const DATE_BAR_TOP_PX = 400;
const GRAB_X_PX = 500;
const TAPPED_COLUMN = 14;

describeFeature(feature, (f: FeatureDescriibeCallbackParams) => {
  const session = createMeetingGridSession();
  let scrollPx = 0;
  let dateBarReads = 0;
  let panelReads = 0;
  let candidateRows = { firstRow: 1, lastRow: 1 };
  let frameCallbacks: FrameRequestCallback[] = [];

  const installGeometry = () => {
    vi.spyOn(Element.prototype, "getBoundingClientRect").mockImplementation(
      function (this: Element) {
        if (this.hasAttribute("data-date-bar")) {
          dateBarReads += 1;
          return { top: DATE_BAR_TOP_PX } as DOMRect;
        }
        if (this.hasAttribute("data-hour-strip")) {
          const row = Array.from(
            document.querySelectorAll("[data-hour-strip]"),
          ).indexOf(this);
          return {
            left: STRIP_LEFT_PX,
            top: FIRST_STRIP_TOP_PX + row * STRIP_PITCH_PX - scrollPx,
            height: STRIP_HEIGHT_PX,
          } as DOMRect;
        }
        if (this.tagName === "UL") panelReads += 1;
        return { left: 0, right: 390, top: 0, height: 400 } as DOMRect;
      },
    );
    vi.spyOn(window, "requestAnimationFrame").mockImplementation((callback) => {
      frameCallbacks.push(callback);
      return frameCallbacks.length;
    });
  };
  const flushFrame = () =>
    act(() => {
      const pending = frameCallbacks;
      frameCallbacks = [];
      for (const callback of pending) callback(0);
    });
  const scrollBy = (valuePx: number) => {
    scrollPx += valuePx;
    act(() => {
      window.dispatchEvent(new Event("scroll"));
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

  f.BeforeEachScenario(async () => {
    scrollPx = 0;
    dateBarReads = 0;
    panelReads = 0;
    frameCallbacks = [];
    pointerSupport.isSupported = true;
    await session.reset();
  });
  f.AfterAllScenarios(session.world.finish);
  f.AfterEachScenario(() => {
    vi.restoreAllMocks();
  });

  // @refine-meeting-range-entry-and-handles @FR7
  f.ScenarioOutline(
    "Handle rows among the visible rows",
    ({ Given, When, Then }, variables) => {
      let endRow = 0;
      let startRow = 0;
      Given("the candidate rows are rows <first> to <last> of the list", () => {
        candidateRows = {
          firstRow: Number(variables.first),
          lastRow: Number(variables.last),
        };
      });
      When("the handle rows are chosen", () => {
        endRow = getMeetingHandleRow(MeetingHandle.END, candidateRows);
        startRow = getMeetingHandleRow(MeetingHandle.START, candidateRows);
      });
      Then(
        "the end handle stands on row <end> and the start handle on row <start>",
        () => {
          expect(endRow).toBe(Number(variables.end));
          expect(startRow).toBe(Number(variables.start));
        },
      );
    },
  );

  // @refine-meeting-range-entry-and-handles @NFR-P1
  f.Scenario(
    "Scrolling re-places the handles cheaply",
    ({ Given, When, Then }) => {
      let dateBarReadsBefore = 0;
      let panelReadsBefore = 0;
      Given(
        "the Grid view with 12 locations and the meeting range 09:00–11:00 in Almaty",
        async () => {
          installGeometry();
          await session.openGrid(CITIES);
          setSampleMeeting();
          flushFrame();
        },
      );
      When("three scroll events arrive before the next animation frame", () => {
        dateBarReadsBefore = dateBarReads;
        scrollBy(100);
        scrollBy(10);
        scrollBy(10);
        flushFrame();
      });
      Then("the hour strips are measured once", () => {
        expect(dateBarReads - dateBarReadsBefore).toBe(1);
      });
      When("a scroll leaves the candidate rows unchanged", () => {
        panelReadsBefore = panelReads;
        scrollBy(1);
        flushFrame();
      });
      Then("no meeting handle is rendered again", () => {
        expect(panelReads).toBe(panelReadsBefore);
      });
    },
  );

  // @refine-meeting-range-entry-and-handles @FR8
  f.Scenario(
    "A click after a handle drag is not a tap",
    ({ Given, When, Then }) => {
      Given(
        "the Grid view with the meeting range 09:00–11:00 in Almaty",
        async () => {
          installGeometry();
          await session.openGridWithSampleMeeting();
        },
      );
      When(
        "the user drags the end handle one cell to the right and the browser then sends the click of that gesture to an hour cell of column 14",
        () => {
          const endHandle = handleOf("endHandle");
          fireEvent.pointerDown(endHandle, { clientX: GRAB_X_PX });
          fireEvent.pointerMove(endHandle, {
            clientX: GRAB_X_PX + cellPitchPx(),
          });
          fireEvent.pointerUp(endHandle, {
            clientX: GRAB_X_PX + cellPitchPx(),
          });
          tapColumn("Almaty", TAPPED_COLUMN);
        },
      );
      Then("the meeting range is 09:00–12:00", () => {
        expect(spanOf("Almaty")).toBe("09:00–12:00");
      });
    },
  );

  // @refine-meeting-range-entry-and-handles @FR8
  f.Scenario(
    "Finger drag without Pointer Events",
    ({ Given, When, Then, And }) => {
      let isTouchEndNotPrevented = true;
      Given(
        "an engine without Pointer Events and the meeting range 09:00–10:00",
        async () => {
          pointerSupport.isSupported = false;
          installGeometry();
          await session.openGrid();
          tapColumn("Almaty", 9);
          await screen.findAllByRole("slider", { name: /Meeting end/ });
        },
      );
      When(
        "the user drags the end handle with a finger by one cell to the right",
        () => {
          const endHandle = handleOf("endHandle");
          const touchAt = (clientX: number) => ({
            changedTouches: [{ identifier: 1, clientX, clientY: 0 }],
          });
          fireEvent.touchStart(endHandle, touchAt(GRAB_X_PX));
          fireEvent.touchMove(endHandle, touchAt(GRAB_X_PX + cellPitchPx()));
          isTouchEndNotPrevented = fireEvent.touchEnd(
            endHandle,
            touchAt(GRAB_X_PX + cellPitchPx()),
          );
        },
      );
      Then("the meeting range is 09:00–11:00", () => {
        expect(spanOf("Almaty")).toBe("09:00–11:00");
      });
      And("the end of the finger drag produces no click", () => {
        expect(isTouchEndNotPrevented).toBe(false);
      });
    },
  );
});
