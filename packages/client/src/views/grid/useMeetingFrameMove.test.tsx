// Verifies FR15, FR16, FR19, FR20 of move-meeting-range-and-extend-past-midnight.
import { act, fireEvent, render } from "@testing-library/react";
import { useState } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  REORDER_POINTER_ACTIVATION_DISTANCE_PX,
  REORDER_TOUCH_ACTIVATION_DELAY_MS,
  REORDER_TOUCH_ACTIVATION_TOLERANCE_PX,
} from "@/constants";
import { useMeetingFrameMove } from "./useMeetingFrameMove";

const PITCH_PX = 40;
const STRIP_LEFT_PX = 0;
const FRAME = { startMinutes: 780, endMinutes: 900 }; // 13:00–15:00
const INSIDE_X = 13.5 * PITCH_PX + STRIP_LEFT_PX;
const OUTSIDE_X = 9.5 * PITCH_PX;

let holdCallbacks: Array<{ callback: () => void; delay: number }> = [];
const onMoveTo = vi.fn();
const onActiveChange = vi.fn();

function Harness({ isFramed = true }: { isFramed?: boolean }) {
  const [panel, setPanel] = useState<HTMLUListElement | null>(null);
  useMeetingFrameMove({
    panelElement: panel,
    frame: isFramed ? FRAME : undefined,
    cellPitchPx: PITCH_PX,
    isScrollable: true,
    tailCellCount: 0,
    onMoveTo,
    onActiveChange,
  });
  return (
    <ul ref={setPanel} data-testid="panel">
      <li>
        <div data-hour-strip data-testid="strip" />
      </li>
    </ul>
  );
}

const touch = (clientX: number, clientY = 0) => ({
  changedTouches: [{ clientX, clientY, identifier: 0 }],
});
const fireHold = () =>
  act(() => {
    const [hold] = holdCallbacks;
    holdCallbacks = [];
    hold?.callback();
  });

describe("useMeetingFrameMove", () => {
  beforeEach(() => {
    holdCallbacks = [];
    onMoveTo.mockReset();
    onActiveChange.mockReset();
    vi.spyOn(Element.prototype, "getBoundingClientRect").mockImplementation(
      () => ({ left: STRIP_LEFT_PX, right: 390, top: 0 }) as DOMRect,
    );
    vi.spyOn(window, "setTimeout").mockImplementation(((
      callback: () => void,
      delay: number,
    ) => {
      holdCallbacks.push({ callback, delay });
      return holdCallbacks.length;
    }) as unknown as typeof window.setTimeout);
    vi.spyOn(window, "clearTimeout").mockImplementation(() => {
      holdCallbacks = [];
    });
  });
  afterEach(() => vi.restoreAllMocks());

  describe("with a mouse", () => {
    const mouse = (clientX: number) => ({ pointerType: "mouse", clientX });

    it("should move the range after the activation distance", () => {
      const { getByTestId } = render(<Harness />);
      const strip = getByTestId("strip");

      fireEvent.pointerDown(strip, mouse(INSIDE_X));
      fireEvent.pointerMove(strip, mouse(INSIDE_X + 60));

      expect(onMoveTo).toHaveBeenLastCalledWith(780 + 90);
    });

    it("should not move the range before the activation distance", () => {
      const { getByTestId } = render(<Harness />);
      const strip = getByTestId("strip");

      fireEvent.pointerDown(strip, mouse(INSIDE_X));
      fireEvent.pointerMove(
        strip,
        mouse(INSIDE_X + REORDER_POINTER_ACTIVATION_DISTANCE_PX - 1),
      );

      expect(onMoveTo).not.toHaveBeenCalled();
    });

    it("should move nothing from a press outside the frame", () => {
      const { getByTestId } = render(<Harness />);
      const strip = getByTestId("strip");

      fireEvent.pointerDown(strip, mouse(OUTSIDE_X));
      fireEvent.pointerMove(strip, mouse(OUTSIDE_X + 60));

      expect(onMoveTo).not.toHaveBeenCalled();
    });

    it("should report the move as active until the release", () => {
      const { getByTestId } = render(<Harness />);
      const strip = getByTestId("strip");

      fireEvent.pointerDown(strip, mouse(INSIDE_X));
      fireEvent.pointerMove(strip, mouse(INSIDE_X + 60));
      fireEvent.pointerUp(strip, mouse(INSIDE_X + 60));

      expect(onActiveChange.mock.calls).toEqual([[true], [false]]);
    });

    it("should move nothing without a meeting frame", () => {
      const { getByTestId } = render(<Harness isFramed={false} />);
      const strip = getByTestId("strip");

      fireEvent.pointerDown(strip, mouse(INSIDE_X));
      fireEvent.pointerMove(strip, mouse(INSIDE_X + 60));

      expect(onMoveTo).not.toHaveBeenCalled();
    });
  });

  describe("with a finger", () => {
    it("should start a move after the hold", () => {
      const { getByTestId } = render(<Harness />);
      const strip = getByTestId("strip");

      fireEvent.touchStart(strip, touch(INSIDE_X));
      expect(holdCallbacks[0].delay).toBe(REORDER_TOUCH_ACTIVATION_DELAY_MS);
      fireHold();
      fireEvent.touchMove(strip, touch(INSIDE_X + PITCH_PX));

      expect(onMoveTo).toHaveBeenLastCalledWith(780 + 60);
    });

    // D6: a touchmove after the hold is default-prevented
    it("should prevent the default of a touchmove after the hold", () => {
      const { getByTestId } = render(<Harness />);
      const strip = getByTestId("strip");
      fireEvent.touchStart(strip, touch(INSIDE_X));
      fireHold();

      const isNotPrevented = fireEvent.touchMove(
        strip,
        touch(INSIDE_X + PITCH_PX),
      );

      expect(isNotPrevented).toBe(false);
    });

    // D6: a touchmove before the hold is not, so a swipe still scrolls
    it("should leave a touchmove before the hold to the browser", () => {
      const { getByTestId } = render(<Harness />);
      const strip = getByTestId("strip");
      fireEvent.touchStart(strip, touch(INSIDE_X));

      const isNotPrevented = fireEvent.touchMove(
        strip,
        touch(INSIDE_X + PITCH_PX),
      );

      expect(isNotPrevented).toBe(true);
    });

    it("should cancel the hold of a finger that moves farther than the tolerance", () => {
      const { getByTestId } = render(<Harness />);
      const strip = getByTestId("strip");

      fireEvent.touchStart(strip, touch(INSIDE_X));
      fireEvent.touchMove(
        strip,
        touch(INSIDE_X + REORDER_TOUCH_ACTIVATION_TOLERANCE_PX + 1),
      );

      expect(holdCallbacks).toHaveLength(0);
    });

    // FR16, D6: a finger that enters another cell is a cell drag, not a hold
    it("should cancel the hold of a finger that enters another cell within the tolerance", () => {
      const { getByTestId } = render(<Harness />);
      const strip = getByTestId("strip");
      const nearCellEdgeX = 14 * PITCH_PX - 2;

      fireEvent.touchStart(strip, touch(nearCellEdgeX));
      fireEvent.touchMove(strip, touch(nearCellEdgeX + 3));

      expect(holdCallbacks).toHaveLength(0);
    });

    it("should keep the hold of a finger that stays within the tolerance", () => {
      const { getByTestId } = render(<Harness />);
      const strip = getByTestId("strip");

      fireEvent.touchStart(strip, touch(INSIDE_X));
      fireEvent.touchMove(
        strip,
        touch(INSIDE_X + REORDER_TOUCH_ACTIVATION_TOLERANCE_PX),
      );

      expect(holdCallbacks).toHaveLength(1);
    });

    it("should hold nothing for a press outside the frame", () => {
      const { getByTestId } = render(<Harness />);

      fireEvent.touchStart(getByTestId("strip"), touch(OUTSIDE_X));

      expect(holdCallbacks).toHaveLength(0);
    });

    it("should end the move at the lift of the finger", () => {
      const { getByTestId } = render(<Harness />);
      const strip = getByTestId("strip");
      fireEvent.touchStart(strip, touch(INSIDE_X));
      fireHold();

      fireEvent.touchEnd(strip, touch(INSIDE_X));

      expect(onActiveChange.mock.calls).toEqual([[true], [false]]);
    });
  });
});
