// Verifies FR17, UX2 of move-meeting-range-and-extend-past-midnight.
import { describe, expect, it } from "vitest";
import { getMoveHandleCentre } from "./moveHandlePlacement";

const BAR_BOTTOM_PX = 85;
const FRAME = { left: 100, width: 80 };

describe("getMoveHandleCentre", () => {
  // The frame top at scroll 0, 4, 7 and 400 px with today's sizes: the axes are 7 px apart.
  it.each([
    ["scroll 0: the frame's top line is below the bar's line", 90, 91.5],
    ["scroll 4: the frame's top line is still below it", 86, 87.5],
    ["scroll 7: the two axes meet", 83, 84.5],
    ["scroll 400: the frame's top is far above the bar", -310, 84.5],
  ])("should place the handle: %s", (_name, frameTopPx, expectedY) => {
    const centre = getMoveHandleCentre(
      { ...FRAME, top: frameTopPx },
      { bottom: BAR_BOTTOM_PX },
    );

    expect(centre.y).toBe(expectedY);
  });

  it("should centre the handle horizontally on the frame", () => {
    const centre = getMoveHandleCentre(
      { ...FRAME, top: 90 },
      { bottom: BAR_BOTTOM_PX },
    );

    expect(centre.x).toBe(140);
  });

  it("should stand on the axis of the frame's top line when there is no meeting bar", () => {
    expect(getMoveHandleCentre({ ...FRAME, top: -20 }, undefined).y).toBe(
      -18.5,
    );
  });
});
