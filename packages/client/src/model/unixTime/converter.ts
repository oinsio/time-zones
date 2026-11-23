import { Temporal } from "@/lib/temporal";
import { ReferenceMode } from "@/model";
import {
  type ConverterCommand,
  ConverterCommandType,
} from "./converterCommands";
import { ConverterInputError } from "./converterInputError";
import { type ConverterState, writeInputText } from "./converterState";
import { toWholeSecondExactInstant } from "./exactInstant";
import { parseIsoInstantText } from "./parseIsoInstantText";
import { type ParseMomentResult, parseUnixTimeText } from "./parseUnixTimeText";
import { reduceConverterRow } from "./reduceConverterRow";
import {
  getFixedUnit,
  UnixTimeUnit,
  type UnixTimeUnitChoice,
} from "./unixTimeUnit";

/** A number first, then an ISO 8601 text; the error of the reading that got furthest. */
export function parseConverterText(
  text: string,
  unitChoice: UnixTimeUnitChoice,
): ParseMomentResult {
  const asNumber = parseUnixTimeText(text, unitChoice);
  if (asNumber.ok || asNumber.error === ConverterInputError.OUT_OF_RANGE) {
    return asNumber;
  }
  const asIso = parseIsoInstantText(text);
  return asIso.ok ? asIso : { ok: false, error: asIso.error };
}

const isBlank = (text: string): boolean => text.trim() === "";

/** Applies the text under a unit choice: sets the moment, or keeps everything and names the error. */
function readInput(
  state: ConverterState,
  text: string,
  unitChoice: UnixTimeUnitChoice,
): ConverterState {
  const readState: ConverterState = {
    ...state,
    unitChoice,
    inputText: text,
    isInputTyped: true,
    rowNote: undefined,
  };
  if (isBlank(text)) return { ...readState, inputError: undefined };
  const parsed = parseConverterText(text, unitChoice);
  if (!parsed.ok) return { ...readState, inputError: parsed.error };
  return {
    ...readState,
    mode: ReferenceMode.PINNED,
    moment: parsed.instant,
    precision: parsed.precision,
    unit: parsed.unit ?? getFixedUnit(unitChoice) ?? state.unit,
    inputError: undefined,
  };
}

function chooseUnit(
  state: ConverterState,
  unitChoice: UnixTimeUnitChoice,
): ConverterState {
  if (state.isInputTyped) return readInput(state, state.inputText, unitChoice);
  return writeInputText({ ...state, unitChoice, rowNote: undefined });
}

function setLive(state: ConverterState, nowEpochMilliseconds: number) {
  return {
    ...state,
    mode: ReferenceMode.LIVE,
    moment: toWholeSecondExactInstant(
      Temporal.Instant.fromEpochMilliseconds(nowEpochMilliseconds),
    ),
    precision: UnixTimeUnit.SECONDS,
  };
}

/**
 * Applies a command. An unchanged state returns the same object.
 * Implements FR6, FR7, FR10, FR11, FR14, FR15 of add-unix-time-converter-tool (D5).
 */
export function reduceConverter(
  state: ConverterState,
  command: ConverterCommand,
): ConverterState {
  switch (command.type) {
    case ConverterCommandType.TYPE_INPUT:
      return readInput(state, command.text, state.unitChoice);
    case ConverterCommandType.CHOOSE_UNIT:
      return chooseUnit(state, command.unitChoice);
    case ConverterCommandType.SET_ROW_WALL_TIME:
    case ConverterCommandType.SET_ROW_DATE:
      return reduceConverterRow(state, command);
    case ConverterCommandType.RETURN_TO_NOW:
      return writeInputText({
        ...setLive(state, command.nowEpochMilliseconds),
        rowNote: undefined,
      });
    case ConverterCommandType.TICK: {
      if (state.mode !== ReferenceMode.LIVE) return state;
      const ticked = setLive(state, command.nowEpochMilliseconds);
      return state.isInputTyped ? ticked : writeInputText(ticked);
    }
  }
}
