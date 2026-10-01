// Verifies UX1, NFR-A4 of reorder-locations-by-drag-and-drop.
import {
  REORDER_TRANSITION_DURATION_MS,
  REORDER_TRANSITION_EASING,
} from "@/constants";
import { getReorderTransition } from "./reorderTransition";

describe("getReorderTransition", () => {
  it("should slide with the reorder duration and easing", () => {
    expect(getReorderTransition(false)).toEqual({
      duration: REORDER_TRANSITION_DURATION_MS,
      easing: REORDER_TRANSITION_EASING,
    });
  });

  it("should slide for 200 ms with the ease curve", () => {
    expect(getReorderTransition(false)).toEqual({
      duration: 200,
      easing: "ease",
    });
  });

  it("should give no transition when motion is reduced", () => {
    expect(getReorderTransition(true)).toBeNull();
  });
});
