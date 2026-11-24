import type { UnixTimeUnitChoice } from "./unixTimeUnit";

/**
 * Commands of the Unix time converter: plain JSON (ADR-0002); each carries the
 * clock's instant where it needs one, so the reducer stays pure.
 * Implements FR6, FR7, FR10, FR11, FR14 of add-unix-time-converter-tool (D5).
 */
export enum ConverterCommandType {
  TYPE_INPUT = "TYPE_INPUT",
  CHOOSE_UNIT = "CHOOSE_UNIT",
  SET_ROW_WALL_TIME = "SET_ROW_WALL_TIME",
  SET_ROW_DATE = "SET_ROW_DATE",
  RETURN_TO_NOW = "RETURN_TO_NOW",
  TICK = "TICK",
}

/** The row a row command was made in. */
export type ConverterRowTarget = { locationId: string; timeZoneId: string };

/** A wall-clock time with seconds and 0 to 9 fraction digits, as typed in a row. */
export type ConverterRowWallTime = {
  hour: number;
  minute: number;
  second: number;
  /** The digits after the decimal point; none when the text has no fraction. */
  fractionDigits: string;
};

export type ConverterCommand =
  | { type: ConverterCommandType.TYPE_INPUT; text: string }
  | { type: ConverterCommandType.CHOOSE_UNIT; unitChoice: UnixTimeUnitChoice }
  | ({
      type: ConverterCommandType.SET_ROW_WALL_TIME;
      wallTime: ConverterRowWallTime;
    } & ConverterRowTarget)
  | ({
      type: ConverterCommandType.SET_ROW_DATE;
      /** ISO date, `"2026-11-24"`. */
      isoDate: string;
    } & ConverterRowTarget)
  | { type: ConverterCommandType.RETURN_TO_NOW; nowEpochMilliseconds: number }
  | { type: ConverterCommandType.TICK; nowEpochMilliseconds: number };
