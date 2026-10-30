// Verifies FR1, FR2, FR3, NFR-A1 of fix-day-track-drag-continuity-and-smoothness.
import { fireEvent } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import {
  ALMATY_TRACK,
  setupInteractiveTrack as setup,
} from "./dayTrackFixture";
import { formatPercent } from "./dayTrackGradient";

const pointer = (type: string, clientX: number, clientY = 0) => ({
  pointerType: type,
  clientX,
  clientY,
  pointerId: 1,
});
const handleOf = (slider: HTMLElement) =>
  slider.querySelector<HTMLElement>("[data-day-track-handle]") as HTMLElement;
const SETTLED_LEFT = formatPercent(ALMATY_TRACK.fraction);

describe("DayTrack drag", () => {
  it("should keep selecting when a touch drag leaves the bar vertically", () => {
    const { slider, onSelectFraction } = setup();
    fireEvent.pointerDown(slider, pointer("touch", 100, 0));
    fireEvent.pointerMove(slider, pointer("touch", 150, 0));

    fireEvent.pointerMove(slider, pointer("touch", 300, 500));

    expect(onSelectFraction).toHaveBeenLastCalledWith(0.75);
  });

  it.each(["pointerUp", "pointerCancel"] as const)(
    "should cancel the default touchmove only during a drag ended by %s",
    (endEvent) => {
      const { slider } = setup();
      expect(fireEvent.touchMove(slider)).toBe(true);
      fireEvent.pointerDown(slider, pointer("touch", 100, 0));
      fireEvent.pointerMove(slider, pointer("touch", 150, 0));
      expect(fireEvent.touchMove(slider)).toBe(false);
      fireEvent[endEvent](slider, pointer("touch", 150, 0));
      expect(fireEvent.touchMove(slider)).toBe(true);
    },
  );

  it("should not cancel touchmove during a vertical swipe", () => {
    const { slider } = setup();
    fireEvent.pointerDown(slider, pointer("touch", 100, 0));
    fireEvent.pointerMove(slider, pointer("touch", 102, 50));

    expect(fireEvent.touchMove(slider)).toBe(true);
  });

  it("should place the handle at the pointer during a mouse drag", () => {
    const { slider } = setup();
    fireEvent.pointerDown(slider, pointer("mouse", 100));

    fireEvent.pointerMove(slider, pointer("mouse", 204.8));

    expect(handleOf(slider).style.left).toBe("51.2%");
    expect(slider).toHaveAttribute("aria-valuenow", "750");
  });

  it.each(["pointerUp", "pointerCancel"] as const)(
    "should settle the handle after %s",
    (endEvent) => {
      const { slider } = setup();
      fireEvent.pointerDown(slider, pointer("mouse", 100));
      fireEvent.pointerMove(slider, pointer("mouse", 204.8));

      fireEvent[endEvent](slider, pointer("mouse", 204.8));

      expect(handleOf(slider).style.left).toBe(SETTLED_LEFT);
    },
  );

  it("should not move the handle on a vertical swipe", () => {
    const { slider } = setup();
    fireEvent.pointerDown(slider, pointer("touch", 100, 0));
    fireEvent.pointerMove(slider, pointer("touch", 102, 50));

    expect(handleOf(slider).style.left).toBe(SETTLED_LEFT);
  });
});
