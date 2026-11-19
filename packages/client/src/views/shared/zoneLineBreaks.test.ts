// Verifies FR9 of redesign-cards-grid-and-day-palettes.
import { describe, expect, it } from "vitest";
import { getZoneLinePartLineStarts } from "./zoneLineBreaks";

describe("getZoneLinePartLineStarts", () => {
  it.each([
    [
      [0, 0, 20],
      [true, false, true],
    ],
    [
      [0, 0, 0],
      [true, false, false],
    ],
    [
      [0, 20, 40],
      [true, true, true],
    ],
    [[5], [true]],
    [[], []],
  ])("should read the tops %j as line starts %j", (tops, expected) => {
    expect(getZoneLinePartLineStarts(tops)).toEqual(expected);
  });
});
