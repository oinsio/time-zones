// Verifies UX2 of reorder-locations-by-drag-and-drop.
import type { Modifier } from "@dnd-kit/core";
import { restrictToVerticalAxis } from "./reorderModifiers";

const modify = (transform: { x: number; y: number }) =>
  restrictToVerticalAxis({
    transform: { ...transform, scaleX: 1, scaleY: 1 },
  } as Parameters<Modifier>[0]);

describe("restrictToVerticalAxis", () => {
  it.each([-30, 0, 45])("should zero the horizontal move %i", (x) => {
    expect(modify({ x, y: 10 }).x).toBe(0);
  });

  it("should keep the vertical move and the scale", () => {
    expect(modify({ x: 20, y: 70 })).toEqual({
      x: 0,
      y: 70,
      scaleX: 1,
      scaleY: 1,
    });
  });
});
