// Verifies FR2, FR6 of add-wall-time-input-with-hint (D3, M4).
import { describe, expect, it } from "vitest";
import { parseWallTimeInput } from "./parseWallTimeInput";

describe("parseWallTimeInput", () => {
  it.each([
    ["9", "09:00"],
    ["09", "09:00"],
    ["930", "09:30"],
    ["0930", "09:30"],
    ["9:30", "09:30"],
    ["09:30", "09:30"],
    ["09.30", "09:30"],
    ["9.30", "09:30"],
    [" 9:30 ", "09:30"],
    ["0:00", "00:00"],
    ["23:59", "23:59"],
    ["2359", "23:59"],
  ])("reads %j as %s", (text, expected) => {
    expect(parseWallTimeInput(text)).toBe(expected);
  });

  it.each([
    ["24:00"],
    ["9:60"],
    ["abc"],
    ["12345"],
    ["9:3"],
    [""],
    ["   "],
    ["24"],
    ["9:30pm"],
    ["9,30"],
    ["09:30\n10"],
  ])("rejects %j", (text) => {
    expect(parseWallTimeInput(text)).toBeUndefined();
  });
});
