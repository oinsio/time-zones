import type { Temporal } from "@/lib/temporal";
import { ReferenceMode, type WallClockStatus } from "@/model";
import type { ConverterInputError } from "./converterInputError";
import { type ExactInstant, toWholeSecondExactInstant } from "./exactInstant";
import { formatUnixTime } from "./formatUnixTime";
import { getFixedUnit, UnixTimeUnit, UnixTimeUnitChoice } from "./unixTimeUnit";

/** A row time that landed in a DST gap or overlap, for the hint under that row. */
export type ConverterRowNote = {
  locationId: string;
  status: WallClockStatus;
};

/**
 * The converter's own moment (live or pinned), how it was typed and what the
 * input shows. Never stored (ADR-0003, NG8).
 * Implements FR6, FR7, FR14, FR15 of add-unix-time-converter-tool (D5).
 */
export type ConverterState = {
  mode: ReferenceMode;
  moment: ExactInstant;
  /** The digits the moment carries: the unit of the value it was given. */
  precision: UnixTimeUnit;
  unitChoice: UnixTimeUnitChoice;
  /** The unit in force: the one the input text is read or written in. */
  unit: UnixTimeUnit;
  inputText: string;
  /** The user typed the text; the app writes it otherwise. */
  isInputTyped: boolean;
  inputError?: ConverterInputError;
  rowNote?: ConverterRowNote;
};

/** The unit a text the app writes uses: the fixed unit, or the precision under Auto. */
export const getWrittenUnit = (
  unitChoice: UnixTimeUnitChoice,
  precision: UnixTimeUnit,
): UnixTimeUnit => getFixedUnit(unitChoice) ?? precision;

/** The state with the input rewritten from the moment, as a text the app wrote. */
export function writeInputText(state: ConverterState): ConverterState {
  const unit = getWrittenUnit(state.unitChoice, state.precision);
  return {
    ...state,
    unit,
    inputText: formatUnixTime(state.moment, unit),
    isInputTyped: false,
    inputError: undefined,
  };
}

/** The converter at the clock's whole second, live, the unit choice Auto. Implements FR14. */
export function createConverterState(now: Temporal.Instant): ConverterState {
  return writeInputText({
    mode: ReferenceMode.LIVE,
    moment: toWholeSecondExactInstant(now),
    precision: UnixTimeUnit.SECONDS,
    unitChoice: UnixTimeUnitChoice.AUTO,
    unit: UnixTimeUnit.SECONDS,
    inputText: "",
    isInputTyped: false,
  });
}
