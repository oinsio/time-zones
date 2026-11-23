// Public API of the Unix time model (ADR-0002, D11 of add-unix-time-converter-tool).
// Not re-exported from `model/index.ts`: only the converter chunk imports it.
export { ConverterInputError } from "./converterInputError";
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
