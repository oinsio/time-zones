import { NANOSECONDS_PER_SECOND } from "@/constants";
import type { Temporal } from "@/lib/temporal";
import { ReferenceMode, WallClockStatus } from "@/model";
import { ConverterInputError } from "./converterInputError";
import { type ExactInstant, toWholeSecondExactInstant } from "./exactInstant";
import { formatUnixTime } from "./formatUnixTime";
import { getFixedUnit, UnixTimeUnit, UnixTimeUnitChoice } from "./unixTimeUnit";

/** A row time that landed in a DST gap or overlap, for the hint under that row. */
export type ConverterRowNote = {
  locationId: string;
  status: WallClockStatus;
  /** The wall time the user asked for, as `HH:MM:SS`, for the hint under the row. */
  requestedWallTime: string;
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

const isEnumValue = (enumObject: object, value: unknown): boolean =>
  Object.values(enumObject).includes(value);

const isNanosecondsOfSecond = (value: unknown): boolean =>
  Number.isInteger(value) &&
  (value as number) >= 0 &&
  (value as number) < NANOSECONDS_PER_SECOND;

function isRowNote(value: unknown): boolean {
  if (typeof value !== "object" || value === null) return false;
  const { locationId, status, requestedWallTime } = value as Record<
    string,
    unknown
  >;
  return (
    typeof locationId === "string" &&
    isEnumValue(WallClockStatus, status) &&
    typeof requestedWallTime === "string"
  );
}

/**
 * Whether a value the shell kept for the tool is a converter state: a tool
 * page validates what it reads, and an invalid value starts live.
 * Implements FR14 of add-unix-time-converter-tool (D8).
 */
export function isConverterState(value: unknown): value is ConverterState {
  if (typeof value !== "object" || value === null) return false;
  const candidate = value as Record<string, unknown>;
  const { moment } = candidate;
  return (
    isEnumValue(ReferenceMode, candidate.mode) &&
    typeof moment === "object" &&
    moment !== null &&
    Number.isInteger((moment as ExactInstant).unixSeconds) &&
    isNanosecondsOfSecond((moment as ExactInstant).nanoseconds) &&
    isEnumValue(UnixTimeUnit, candidate.precision) &&
    isEnumValue(UnixTimeUnitChoice, candidate.unitChoice) &&
    isEnumValue(UnixTimeUnit, candidate.unit) &&
    typeof candidate.inputText === "string" &&
    typeof candidate.isInputTyped === "boolean" &&
    (candidate.inputError === undefined ||
      isEnumValue(ConverterInputError, candidate.inputError)) &&
    (candidate.rowNote === undefined || isRowNote(candidate.rowNote))
  );
}
