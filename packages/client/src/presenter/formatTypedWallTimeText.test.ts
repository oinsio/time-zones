// Verifies FR6 of refine-meeting-range-entry-and-handles.
import { describe, expect, it } from "vitest";
import { formatTypedWallTimeText } from "./formatTypedWallTimeText";

describe("formatTypedWallTimeText", () => {
  it.each([
    ["1", "1"],
    ["10", "10"],
    ["103", "10:3"],
    ["1030", "10:30"],
    ["9", "9"],
    ["93", "9:3"],
    ["930", "9:30"],
    ["0930", "09:30"],
    ["24", "2:4"],
    ["2359", "23:59"],
    ["12345", "12:345"],
    ["13", "13"],
    ["130", "13:0"],
    ["9:3", "9:3"],
    ["09.30", "09.30"],
    ["9 am", "9 am"],
    ["abc", "abc"],
    ["", ""],
  ])("should show typed %j as %j", (typedText, expected) => {
    expect(formatTypedWallTimeText(typedText)).toBe(expected);
  });
});
