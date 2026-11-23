// Verifies FR6, FR7, FR11, FR14, FR15 of add-unix-time-converter-tool.
import { describe, expect, it } from "vitest";
import { fakeClock } from "@/lib/temporal";
import { ReferenceMode } from "@/model";
import { reduceConverter } from "./converter";
import { ConverterCommandType } from "./converterCommands";
import { ConverterInputError } from "./converterInputError";
import { type ConverterState, createConverterState } from "./converterState";
import { formatExactIsoInstant } from "./formatUnixTime";
import { UnixTimeUnit, UnixTimeUnitChoice } from "./unixTimeUnit";

const NOW = fakeClock("2026-11-23T11:23:07Z");
const NOW_MILLISECONDS = NOW.instant().epochMilliseconds;

const initial = () => createConverterState(NOW.instant());
const typeInput = (state: ConverterState, text: string) =>
  reduceConverter(state, { type: ConverterCommandType.TYPE_INPUT, text });
const chooseUnit = (state: ConverterState, unitChoice: UnixTimeUnitChoice) =>
  reduceConverter(state, {
    type: ConverterCommandType.CHOOSE_UNIT,
    unitChoice,
  });
const tick = (state: ConverterState, secondsLater: number) =>
  reduceConverter(state, {
    type: ConverterCommandType.TICK,
    nowEpochMilliseconds: NOW_MILLISECONDS + secondsLater * 1000,
  });
const isoOf = (state: ConverterState) =>
  formatExactIsoInstant(state.moment, state.precision);

describe("the initial converter state", () => {
  it("should be live at the clock's whole second with the text in seconds", () => {
    expect(initial()).toMatchObject({
      mode: ReferenceMode.LIVE,
      moment: { unixSeconds: 1_795_432_987, nanoseconds: 0 },
      unitChoice: UnixTimeUnitChoice.AUTO,
      unit: UnixTimeUnit.SECONDS,
      inputText: "1795432987",
      isInputTyped: false,
    });
  });
});

describe("TYPE_INPUT", () => {
  it("should pin the moment and keep the typed text", () => {
    const state = typeInput(initial(), "1 700 000 000");
    expect(state).toMatchObject({
      mode: ReferenceMode.PINNED,
      inputText: "1 700 000 000",
      isInputTyped: true,
      inputError: undefined,
    });
    expect(isoOf(state)).toBe("2023-11-14T22:13:20Z");
  });

  it("should take the unit and the precision of a typed number", () => {
    const state = typeInput(initial(), "1795432987123456");
    expect(state).toMatchObject({
      unit: UnixTimeUnit.MICROSECONDS,
      precision: UnixTimeUnit.MICROSECONDS,
    });
  });

  it("should read an ISO 8601 text and keep the unit", () => {
    const state = typeInput(initial(), "2026-11-23T14:23:07.123+03:00");
    expect(state).toMatchObject({
      unit: UnixTimeUnit.SECONDS,
      precision: UnixTimeUnit.MILLISECONDS,
      mode: ReferenceMode.PINNED,
    });
    expect(isoOf(state)).toBe("2026-11-23T11:23:07.123Z");
  });

  it.each([
    ["abc", ConverterInputError.UNREADABLE],
    ["86400000000000000000000", ConverterInputError.OUT_OF_RANGE],
    ["+999999-01-01T00:00:00Z", ConverterInputError.OUT_OF_RANGE],
  ])("should keep the moment and name the error for %j", (text, error) => {
    const before = initial();
    const after = typeInput(before, text);
    expect(after).toMatchObject({
      inputError: error,
      inputText: text,
      isInputTyped: true,
    });
    expect(after.moment).toBe(before.moment);
    expect(after.mode).toBe(ReferenceMode.LIVE);
  });

  it("should clear the error when the text becomes readable", () => {
    const state = typeInput(typeInput(initial(), "abc"), "5");
    expect(state.inputError).toBeUndefined();
  });

  it("should treat an empty text as a hint, with no error and the moment kept", () => {
    const before = initial();
    const after = typeInput(before, "  ");
    expect(after.inputError).toBeUndefined();
    expect(after.moment).toBe(before.moment);
  });
});

describe("CHOOSE_UNIT", () => {
  it("should read a typed number again in the new unit and keep the text", () => {
    const state = chooseUnit(
      typeInput(initial(), "1795432987"),
      UnixTimeUnitChoice.MILLISECONDS,
    );
    expect(isoOf(state)).toBe("1970-01-21T18:43:52.987Z");
    expect(state.inputText).toBe("1795432987");
    const back = chooseUnit(state, UnixTimeUnitChoice.AUTO);
    expect(isoOf(back)).toBe("2026-11-23T11:23:07Z");
  });

  it("should convert a text the app wrote", () => {
    const state = chooseUnit(initial(), UnixTimeUnitChoice.MILLISECONDS);
    expect(state).toMatchObject({
      inputText: "1795432987000",
      mode: ReferenceMode.LIVE,
      unit: UnixTimeUnit.MILLISECONDS,
      isInputTyped: false,
    });
  });

  it("should leave an ISO 8601 text and its moment alone", () => {
    const typed = typeInput(initial(), "2026-11-23T11:23:07.123Z");
    const state = chooseUnit(typed, UnixTimeUnitChoice.NANOSECONDS);
    expect(state.inputText).toBe("2026-11-23T11:23:07.123Z");
    expect(isoOf(state)).toBe("2026-11-23T11:23:07.123Z");
    expect(state.unitChoice).toBe(UnixTimeUnitChoice.NANOSECONDS);
  });

  it("should name the error when a typed fraction meets a fixed unit", () => {
    const typed = typeInput(initial(), "1795432987.5");
    const state = chooseUnit(typed, UnixTimeUnitChoice.MILLISECONDS);
    expect(state.inputError).toBe(ConverterInputError.UNREADABLE);
    expect(state.moment).toBe(typed.moment);
  });

  it("should write an app-written text in the precision under Auto", () => {
    const state = chooseUnit(
      chooseUnit(initial(), UnixTimeUnitChoice.NANOSECONDS),
      UnixTimeUnitChoice.AUTO,
    );
    expect(state.inputText).toBe("1795432987");
  });

  it("should not read an empty text", () => {
    const state = chooseUnit(
      typeInput(initial(), ""),
      UnixTimeUnitChoice.SECONDS,
    );
    expect(state.inputError).toBeUndefined();
  });
});

describe("RETURN_TO_NOW", () => {
  it("should return to live at the current second and write the text", () => {
    const pinned = typeInput(initial(), "1700000000");
    const state = reduceConverter(pinned, {
      type: ConverterCommandType.RETURN_TO_NOW,
      nowEpochMilliseconds: NOW_MILLISECONDS + 5000,
    });
    expect(state).toMatchObject({
      mode: ReferenceMode.LIVE,
      inputText: "1795432992",
      isInputTyped: false,
      precision: UnixTimeUnit.SECONDS,
    });
  });

  it("should write the text in the fixed unit", () => {
    const state = reduceConverter(
      chooseUnit(
        typeInput(initial(), "1700000000"),
        UnixTimeUnitChoice.MILLISECONDS,
      ),
      {
        type: ConverterCommandType.RETURN_TO_NOW,
        nowEpochMilliseconds: NOW_MILLISECONDS,
      },
    );
    expect(state.inputText).toBe("1795432987000");
  });

  it("should clear a message", () => {
    const state = reduceConverter(typeInput(initial(), "abc"), {
      type: ConverterCommandType.RETURN_TO_NOW,
      nowEpochMilliseconds: NOW_MILLISECONDS,
    });
    expect(state.inputError).toBeUndefined();
  });
});

describe("TICK", () => {
  it("should move a live moment and rewrite the text", () => {
    const state = tick(initial(), 1);
    expect(state.inputText).toBe("1795432988");
    expect(state.mode).toBe(ReferenceMode.LIVE);
  });

  it("should keep the unit in force while live", () => {
    const state = tick(
      chooseUnit(initial(), UnixTimeUnitChoice.MILLISECONDS),
      1,
    );
    expect(state.inputText).toBe("1795432988000");
  });

  it("should return the same object for a pinned moment", () => {
    const pinned = typeInput(initial(), "1700000000");
    expect(tick(pinned, 10)).toBe(pinned);
  });

  it("should keep a text the user is typing while the moment follows the clock", () => {
    const typing = typeInput(initial(), "abc");
    const state = tick(typing, 1);
    expect(state.inputText).toBe("abc");
    expect(state.moment.unixSeconds).toBe(1_795_432_988);
  });
});
