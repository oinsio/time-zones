// Verifies FR16, NFR-A3 of redesign-cards-grid-and-day-palettes: disabled menu items are skipped.
import { describe, expect, it } from "vitest";
import {
  getEnabledMenuIndex,
  MenuStepDirection,
} from "./locationMenuNavigation";

describe("getEnabledMenuIndex", () => {
  it.each([
    [[false, false, false], 0, MenuStepDirection.NEXT, 1],
    [[false, true, false], 0, MenuStepDirection.NEXT, 2],
    [[false, true, false], 2, MenuStepDirection.NEXT, 0],
    [[false, true, true], 0, MenuStepDirection.NEXT, 0],
    [[false, false, false], 0, MenuStepDirection.PREVIOUS, 2],
    [[false, true, false], 2, MenuStepDirection.PREVIOUS, 0],
    [[true, false, false], 1, MenuStepDirection.PREVIOUS, 2],
    [[true, false, true], 1, MenuStepDirection.NEXT, 1],
  ])(
    "should step %j from %i %s to %i",
    (disabled, from, direction, expected) => {
      expect(getEnabledMenuIndex(disabled, from, direction)).toBe(expected);
    },
  );

  it("should find the first and the last enabled item from outside the list", () => {
    const disabled = [true, false, false, true];
    expect(getEnabledMenuIndex(disabled, -1, MenuStepDirection.NEXT)).toBe(1);
    expect(
      getEnabledMenuIndex(
        disabled,
        disabled.length,
        MenuStepDirection.PREVIOUS,
      ),
    ).toBe(2);
  });

  it("should stay put when every item is disabled", () => {
    expect(getEnabledMenuIndex([true, true], 0, MenuStepDirection.NEXT)).toBe(
      0,
    );
  });
});
