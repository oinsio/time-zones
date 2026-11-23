// Verifies FR10 of add-unix-time-converter-tool.
import { describe, expect, it } from "vitest";
import { parseExactWallTimeInput } from "./parseExactWallTimeInput";

const MARKERS = { am: "AM", pm: "PM" };
const read = (text: string) => parseExactWallTimeInput(text, MARKERS);

describe("parseExactWallTimeInput", () => {
  it.each([
    ["9", { hour: 9, minute: 0, second: 0, fractionDigits: "" }],
    ["930", { hour: 9, minute: 30, second: 0, fractionDigits: "" }],
    ["9:30", { hour: 9, minute: 30, second: 0, fractionDigits: "" }],
    ["9 PM", { hour: 21, minute: 0, second: 0, fractionDigits: "" }],
    ["9:30:15", { hour: 9, minute: 30, second: 15, fractionDigits: "" }],
    ["09:30:15", { hour: 9, minute: 30, second: 15, fractionDigits: "" }],
    ["9:30:15.5", { hour: 9, minute: 30, second: 15, fractionDigits: "5" }],
    [
      "9:30:15.123456789",
      { hour: 9, minute: 30, second: 15, fractionDigits: "123456789" },
    ],
    ["9:30:15.5 PM", { hour: 21, minute: 30, second: 15, fractionDigits: "5" }],
    ["9:30:15 pm", { hour: 21, minute: 30, second: 15, fractionDigits: "" }],
    ["  9:30:15  ", { hour: 9, minute: 30, second: 15, fractionDigits: "" }],
    ["12:00:00 AM", { hour: 0, minute: 0, second: 0, fractionDigits: "" }],
  ])("should read %j", (text, expected) => {
    expect(read(text)).toEqual(expected);
  });

  it.each([
    "9:30:15.1234567890",
    "9:61:00",
    "9:30:61",
    "25:00:00",
    "9:30:15.",
    "9:30:5",
    "9:30:15x",
    "abc",
    "",
    "9:30.5",
  ])("should not read %j", (text) => {
    expect(read(text)).toBeUndefined();
  });
});
