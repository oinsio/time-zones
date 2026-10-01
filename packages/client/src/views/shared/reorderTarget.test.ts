// Verifies FR3 of reorder-locations-by-drag-and-drop.
import { getMoveTargetIndex } from "./reorderTarget";

const rows = [{ id: "moscow" }, { id: "almaty" }, { id: "tokyo" }];

describe("getMoveTargetIndex", () => {
  it.each([
    ["moscow", "tokyo", 2],
    ["tokyo", "moscow", 0],
    ["moscow", "almaty", 1],
  ])(
    "should give the index of the row %s is dropped over (%s)",
    (activeId, overId, expectedIndex) => {
      expect(getMoveTargetIndex(rows, activeId, overId)).toBe(expectedIndex);
    },
  );

  it.each([
    ["over itself", "almaty", "almaty"],
    ["no over row", "almaty", undefined],
    ["an unknown over row", "almaty", "nowhere"],
  ])("should give undefined for %s", (_case, activeId, overId) => {
    expect(getMoveTargetIndex(rows, activeId, overId)).toBeUndefined();
  });
});
