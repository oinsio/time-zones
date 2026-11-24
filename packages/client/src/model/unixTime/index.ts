// Implements FR6, FR7, FR8, FR9 of add-unix-time-converter-tool (D11): public API of the Unix time model (ADR-0002).
// Not re-exported from `model/index.ts`: only the converter chunk imports it.

export { parseConverterText, reduceConverter } from "./converter";
export {
  type ConverterCommand,
  ConverterCommandType,
  type ConverterRowTarget,
  type ConverterRowWallTime,
} from "./converterCommands";
export { ConverterInputError } from "./converterInputError";
export {
  type ConverterRowNote,
  type ConverterState,
  createConverterState,
  getWrittenUnit,
  isConverterState,
} from "./converterState";
export {
  type ExactInstant,
  getPrecisionOfFractionDigits,
  isExactInstantInRange,
  toInstant,
  toWholeSecondExactInstant,
} from "./exactInstant";
export { formatExactIsoInstant, formatUnixTime } from "./formatUnixTime";
export { parseIsoInstantText } from "./parseIsoInstantText";
export {
  type ParsedMoment,
  type ParseMomentResult,
  parseUnixTimeText,
} from "./parseUnixTimeText";
export {
  getRelativeTime,
  type RelativeTime,
  RelativeTimeDirection,
  RelativeTimeUnit,
} from "./relativeTime";
export {
  detectUnixTimeUnit,
  getFixedUnit,
  UNIX_TIME_UNIT_FRACTION_DIGITS,
  UNIX_TIME_UNITS_BY_PRECISION,
  UnixTimeUnit,
  UnixTimeUnitChoice,
} from "./unixTimeUnit";
