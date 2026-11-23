// Verifies FR10, FR11 of add-unix-time-converter-tool.
import { describe, expect, it } from "vitest";
import { fakeClock } from "@/lib/temporal";
import { ReferenceMode, WallClockStatus } from "@/model";
import { reduceConverter } from "./converter";
import {
  type ConverterCommand,
  ConverterCommandType,
} from "./converterCommands";
import { type ConverterState, createConverterState } from "./converterState";
import { formatExactIsoInstant, formatUnixTime } from "./formatUnixTime";
import { UnixTimeUnit, UnixTimeUnitChoice } from "./unixTimeUnit";

const NEW_YORK = { locationId: "new-york", timeZoneId: "America/New_York" };
const SAMPLE = createConverterState(
  fakeClock("2026-11-23T11:23:07Z").instant(),
);

const setTime = (
  state: ConverterState,
  wallTime: {
    hour: number;
    minute: number;
    second: number;
    fractionDigits: string;
  },
  target = NEW_YORK,
) =>
  reduceConverter(state, {
    type: ConverterCommandType.SET_ROW_WALL_TIME,
    wallTime,
    ...target,
  });
const setDate = (state: ConverterState, isoDate: string, target = NEW_YORK) =>
  reduceConverter(state, {
    type: ConverterCommandType.SET_ROW_DATE,
    isoDate,
    ...target,
  });
const typeInput = (state: ConverterState, text: string) =>
  reduceConverter(state, { type: ConverterCommandType.TYPE_INPUT, text });

describe("SET_ROW_WALL_TIME, a time typed in a row", () => {
  it.each([
    [{ hour: 9, minute: 0, second: 0, fractionDigits: "" }, "1795442400"],
    [{ hour: 9, minute: 30, second: 15, fractionDigits: "" }, "1795444215"],
    [{ hour: 9, minute: 30, second: 15, fractionDigits: "5" }, "1795444215500"],
    [
      { hour: 9, minute: 30, second: 15, fractionDigits: "123456789" },
      "1795444215123456789",
    ],
  ])("should pin %j so the input reads %s", (wallTime, expectedText) => {
    const state = setTime(SAMPLE, wallTime);
    expect(state).toMatchObject({
      mode: ReferenceMode.PINNED,
      inputText: expectedText,
      isInputTyped: false,
      rowNote: { locationId: "new-york", status: WallClockStatus.UNIQUE },
    });
  });

  it("should take the precision from the fraction digits", () => {
    const state = setTime(SAMPLE, {
      hour: 9,
      minute: 0,
      second: 0,
      fractionDigits: "1234",
    });
    expect(state.precision).toBe(UnixTimeUnit.MICROSECONDS);
  });

  it("should use the row's local date", () => {
    // 23 Nov 2026 in New York; 9:00 is the 14:00 UTC instant of that day.
    const state = setTime(SAMPLE, {
      hour: 9,
      minute: 0,
      second: 0,
      fractionDigits: "",
    });
    expect(formatExactIsoInstant(state.moment, state.precision)).toBe(
      "2026-11-23T14:00:00Z",
    );
  });

  it("should resolve a time in a DST gap as the wall-clock owner does", () => {
    const march = typeInput(SAMPLE, "2026-03-08T12:00:00Z");
    const state = setTime(march, {
      hour: 2,
      minute: 30,
      second: 15,
      fractionDigits: "",
    });
    expect(state.rowNote?.status).toBe(WallClockStatus.GAP);
    expect(formatExactIsoInstant(state.moment, state.precision)).toBe(
      "2026-03-08T07:30:15Z",
    );
  });

  it("should resolve a time in a DST overlap to the earlier instant", () => {
    const november = typeInput(SAMPLE, "2026-11-01T12:00:00Z");
    const state = setTime(november, {
      hour: 1,
      minute: 30,
      second: 0,
      fractionDigits: "",
    });
    expect(state.rowNote?.status).toBe(WallClockStatus.AMBIGUOUS);
    expect(formatExactIsoInstant(state.moment, state.precision)).toBe(
      "2026-11-01T05:30:00Z",
    );
  });

  it("should write the input in the fixed unit", () => {
    const state = setTime(
      reduceConverter(SAMPLE, {
        type: ConverterCommandType.CHOOSE_UNIT,
        unitChoice: UnixTimeUnitChoice.MILLISECONDS,
      }),
      { hour: 9, minute: 0, second: 0, fractionDigits: "" },
    );
    expect(state.inputText).toBe("1795442400000");
  });

  it("should round-trip to the nanosecond through the notation", () => {
    const set = setTime(SAMPLE, {
      hour: 9,
      minute: 30,
      second: 15,
      fractionDigits: "123456789",
    });
    const typed = typeInput(
      SAMPLE,
      formatUnixTime(set.moment, UnixTimeUnit.NANOSECONDS),
    );
    expect(typed.moment).toEqual(set.moment);
  });

  it("should leave the state as it was when the time is beyond the range", () => {
    const farFuture = typeInput(SAMPLE, "+275760-09-13T00:00:00Z");
    const state = setTime(farFuture, {
      hour: 23,
      minute: 0,
      second: 0,
      fractionDigits: "",
    });
    expect(state).toBe(farFuture);
  });
});

describe("SET_ROW_DATE", () => {
  it("should keep the row's wall time and fraction on the chosen day", () => {
    const typed = typeInput(SAMPLE, "1795432987123");
    const state = setDate(typed, "2026-11-24");
    expect(state).toMatchObject({
      inputText: "1795519387123",
      mode: ReferenceMode.PINNED,
      precision: UnixTimeUnit.MILLISECONDS,
    });
  });

  it("should resolve a wall time in a gap on the new day", () => {
    const typed = typeInput(SAMPLE, "2026-11-23T02:30:00-05:00");
    const state = setDate(typed, "2026-03-08");
    expect(state.rowNote?.status).toBe(WallClockStatus.GAP);
  });

  it("should leave the state as it was beyond the range", () => {
    const state = setDate(SAMPLE, "+275760-09-14");
    expect(state).toBe(SAMPLE);
  });
});

describe("a row command with no matching command type", () => {
  it("should be a command of the converter", () => {
    const command: ConverterCommand = {
      type: ConverterCommandType.SET_ROW_DATE,
      isoDate: "2026-11-24",
      ...NEW_YORK,
    };
    expect(reduceConverter(SAMPLE, command).rowNote?.locationId).toBe(
      "new-york",
    );
  });
});
