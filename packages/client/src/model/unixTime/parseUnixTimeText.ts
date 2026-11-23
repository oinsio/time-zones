import {
  DECIMAL_BASE,
  MAX_UNIX_TIME_FRACTION_DIGITS,
  NANOSECONDS_PER_SECOND,
} from "@/constants";
import { ConverterInputError } from "./converterInputError";
import {
  type ExactInstant,
  getPrecisionOfFractionDigits,
  isExactInstantInRange,
} from "./exactInstant";
import {
  detectUnixTimeUnit,
  getFixedUnit,
  UNIX_TIME_UNIT_FRACTION_DIGITS,
  UnixTimeUnit,
  type UnixTimeUnitChoice,
} from "./unixTimeUnit";

/** A moment the text sets: its precision and, for a whole number, the unit it was read in. */
export type ParsedMoment = {
  instant: ExactInstant;
  precision: UnixTimeUnit;
  unit?: UnixTimeUnit;
};

export type ParseMomentResult =
  | ({ ok: true } & ParsedMoment)
  | { ok: false; error: ConverterInputError };

export const unreadableMoment: ParseMomentResult = {
  ok: false,
  error: ConverterInputError.UNREADABLE,
};
export const outOfRangeMoment: ParseMomentResult = {
  ok: false,
  error: ConverterInputError.OUT_OF_RANGE,
};

/** A sign, a whole part with separators, an optional decimal point and 1-9 fraction digits. */
const NUMBER_PATTERN = new RegExp(
  `^(-?)(\\d[\\d \\u00a0\\u202f_,]*)(?:\\.(\\d{1,${MAX_UNIX_TIME_FRACTION_DIGITS}}))?$`,
);
const SPACE_OR_UNDERSCORE_PATTERN = /[ \u00a0\u202f_]/g;
const COMMA_GROUPS_PATTERN = /^\d{1,3}(,\d{3})+$/;
const NON_DIGIT_PATTERN = /\D/g;

/** The digits of the whole part, or undefined when its separators are not allowed. */
function readWholeDigits(wholePart: string): string | undefined {
  const withoutSpaces = wholePart.replace(SPACE_OR_UNDERSCORE_PATTERN, "");
  if (!withoutSpaces.includes(",")) return withoutSpaces;
  return COMMA_GROUPS_PATTERN.test(withoutSpaces)
    ? withoutSpaces.replace(NON_DIGIT_PATTERN, "")
    : undefined;
}

/** A fraction of `digitCount` digits as nanoseconds. */
function fractionToNanoseconds(fractionDigits: string): number {
  return Number(fractionDigits.padEnd(MAX_UNIX_TIME_FRACTION_DIGITS, "0"));
}

/** The floor: a negative value with a fraction borrows one second. */
function applySign(
  isNegative: boolean,
  seconds: number,
  nanoseconds: number,
): ExactInstant {
  if (!isNegative) return { unixSeconds: seconds, nanoseconds };
  return nanoseconds === 0
    ? { unixSeconds: -seconds, nanoseconds: 0 }
    : {
        unixSeconds: -seconds - 1,
        nanoseconds: NANOSECONDS_PER_SECOND - nanoseconds,
      };
}

function finish(parsed: ParsedMoment): ParseMomentResult {
  return isExactInstantInRange(parsed.instant)
    ? { ok: true, ...parsed }
    : outOfRangeMoment;
}

/**
 * Reads a Unix time: a whole number in a unit or decimal seconds. Spaces and
 * underscores in the whole part are ignored, commas only as groups of three.
 * Anything else is unreadable here (an ISO 8601 text is `parseIsoInstantText`).
 * Implements FR6, FR7, FR8, FR15 of add-unix-time-converter-tool (D4).
 */
export function parseUnixTimeText(
  text: string,
  choice: UnixTimeUnitChoice,
): ParseMomentResult {
  const match = NUMBER_PATTERN.exec(text.trim());
  if (match === null) return unreadableMoment;
  const [, sign, wholePart, fractionDigits] = match;
  const wholeDigits = readWholeDigits(wholePart);
  if (wholeDigits === undefined) return unreadableMoment;
  const isNegative = sign === "-";
  const fixedUnit = getFixedUnit(choice);

  if (fractionDigits !== undefined) {
    if (fixedUnit !== undefined && fixedUnit !== UnixTimeUnit.SECONDS) {
      return unreadableMoment;
    }
    return finish({
      instant: applySign(
        isNegative,
        Number(wholeDigits),
        fractionToNanoseconds(fractionDigits),
      ),
      precision: getPrecisionOfFractionDigits(fractionDigits.length),
      unit: UnixTimeUnit.SECONDS,
    });
  }

  const unit = fixedUnit ?? detectUnixTimeUnit(wholeDigits.length);
  const unitDigits = UNIX_TIME_UNIT_FRACTION_DIGITS[unit];
  const padded = wholeDigits.padStart(unitDigits + 1, "0");
  const secondsDigits = padded.slice(0, padded.length - unitDigits);
  const unitFraction = padded.slice(padded.length - unitDigits);
  const nanoseconds =
    unitDigits === 0
      ? 0
      : Number(unitFraction) *
        DECIMAL_BASE ** (MAX_UNIX_TIME_FRACTION_DIGITS - unitDigits);
  return finish({
    instant: applySign(isNegative, Number(secondsDigits), nanoseconds),
    precision: unit,
    unit,
  });
}
