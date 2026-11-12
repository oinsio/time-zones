/**
 * Tokens of the future rule text: designations and signed clock times.
 * Implements FR3 of add-zone-rules-from-iana (design D4).
 */
import {
  FUTURE_RULE_MAX_TRANSITION_HOURS,
  FUTURE_RULE_MIN_DESIGNATION_LENGTH,
  SECONDS_PER_HOUR,
  SECONDS_PER_MINUTE,
} from "./zoneRulesConstants.ts";

/** A value read from the start of a text, and the text after it. */
export type Read<Value> = { value: Value; rest: string };

const ANGLE_BRACKET_DESIGNATION = /^<([A-Za-z0-9+-]*)>/;
const LETTERS_DESIGNATION = /^[A-Za-z]+/;
const CLOCK_TIME = /^([+-]?)(\d{1,3})(?::(\d{1,2}))?(?::(\d{1,2}))?/;
const NEGATIVE_SIGN = "-";
const MAX_MINUTES_OR_SECONDS = SECONDS_PER_MINUTE - 1;

export function readDesignation(text: string): Read<string> | undefined {
  const quoted = ANGLE_BRACKET_DESIGNATION.exec(text);
  const designation = quoted ? quoted[1] : LETTERS_DESIGNATION.exec(text)?.[0];
  if (
    designation === undefined ||
    designation.length < FUTURE_RULE_MIN_DESIGNATION_LENGTH
  ) {
    return undefined;
  }
  const consumedLength = designation.length + (quoted ? 2 : 0);
  return { value: designation, rest: text.slice(consumedLength) };
}

/** A signed `hh[:mm[:ss]]`, in seconds with the sign as written (`0 -` keeps zero positive). */
export function readClockTime(text: string): Read<number> | undefined {
  const match = CLOCK_TIME.exec(text);
  if (!match) return undefined;
  const [consumed, sign, hours] = match;
  const minutes = match[3] ?? 0;
  const seconds = match[4] ?? 0;
  if (
    Number(hours) > FUTURE_RULE_MAX_TRANSITION_HOURS ||
    Number(minutes) > MAX_MINUTES_OR_SECONDS ||
    Number(seconds) > MAX_MINUTES_OR_SECONDS
  ) {
    return undefined;
  }
  const magnitude =
    Number(hours) * SECONDS_PER_HOUR +
    Number(minutes) * SECONDS_PER_MINUTE +
    Number(seconds);
  return {
    value: sign === NEGATIVE_SIGN ? 0 - magnitude : magnitude,
    rest: text.slice(consumed.length),
  };
}
