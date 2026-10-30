// Verifies FR4 of fix-day-track-handle-overlap-and-end-of-day.
import { fireEvent } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import {
  BAR_BOX,
  setupInteractiveTrack as setup,
  WIDE_BOX,
} from "./dayTrackFixture";

describe("DayTrack press outside the bar", () => {
  it.each([
    ["left of", 20, 0],
    ["right of", 520, 1],
  ])(
    "should select the nearest end of the day for a press %s the bar",
    (_side, clientX, expected) => {
      const { slider, bar, onSelectFraction } = setup();
      slider.getBoundingClientRect = () => WIDE_BOX;
      bar.getBoundingClientRect = () => BAR_BOX;

      fireEvent.pointerDown(slider, {
        pointerType: "mouse",
        clientX,
        clientY: 0,
        pointerId: 1,
      });

      expect(onSelectFraction).toHaveBeenCalledWith(expected);
    },
  );
});
