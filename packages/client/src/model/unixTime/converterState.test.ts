// Verifies FR14 of add-unix-time-converter-tool.
import { describe, expect, it } from "vitest";
import { fakeClock } from "@/lib/temporal";
import { WallClockStatus } from "@/model";
import { reduceConverter } from "./converter";
import { ConverterCommandType } from "./converterCommands";
import { createConverterState, isConverterState } from "./converterState";

const LIVE = createConverterState(fakeClock("2026-11-23T11:23:07Z").instant());

describe("isConverterState", () => {
  it("should accept a created state and one that went through JSON", () => {
    expect(isConverterState(LIVE)).toBe(true);
    expect(isConverterState(JSON.parse(JSON.stringify(LIVE)))).toBe(true);
  });

  it("should accept a state with an error and a row note", () => {
    const withError = reduceConverter(LIVE, {
      type: ConverterCommandType.TYPE_INPUT,
      text: "abc",
    });
    const withNote = {
      ...LIVE,
      rowNote: {
        locationId: "a",
        status: WallClockStatus.GAP,
        requestedWallTime: "02:30:00",
      },
    };
    expect(isConverterState(withError)).toBe(true);
    expect(isConverterState(withNote)).toBe(true);
  });

  it.each([
    ["undefined", undefined],
    ["null", null],
    ["a text", "state"],
    ["an empty object", {}],
    ["an unknown mode", { ...LIVE, mode: "PAUSED" }],
    ["a missing moment", { ...LIVE, moment: undefined }],
    [
      "a fractional second",
      { ...LIVE, moment: { unixSeconds: 1.5, nanoseconds: 0 } },
    ],
    [
      "nanoseconds out of range",
      { ...LIVE, moment: { unixSeconds: 1, nanoseconds: 1_000_000_000 } },
    ],
    [
      "negative nanoseconds",
      { ...LIVE, moment: { unixSeconds: 1, nanoseconds: -1 } },
    ],
    ["an unknown precision", { ...LIVE, precision: "DAYS" }],
    ["an unknown unit choice", { ...LIVE, unitChoice: "DAYS" }],
    ["an unknown unit", { ...LIVE, unit: "DAYS" }],
    ["a numeric text", { ...LIVE, inputText: 5 }],
    ["a non-boolean typed flag", { ...LIVE, isInputTyped: "yes" }],
    ["an unknown error", { ...LIVE, inputError: "BROKEN" }],
    ["a row note of the wrong shape", { ...LIVE, rowNote: { locationId: 1 } }],
    ["a row note that is not an object", { ...LIVE, rowNote: "note" }],
    [
      "a row note with an unknown status",
      {
        ...LIVE,
        rowNote: {
          locationId: "a",
          status: "X",
          requestedWallTime: "02:30:00",
        },
      },
    ],
  ])("should refuse %s", (_name, value) => {
    expect(isConverterState(value)).toBe(false);
  });
});
