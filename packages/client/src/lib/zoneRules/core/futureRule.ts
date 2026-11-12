/**
 * Reads the future rule: the POSIX TZ string of a TZif footer, with the RFC 9636
 * §3.3 extensions (angle-bracket designations, hours up to 167, negative
 * transition times). POSIX offsets are positive west; they are negated into
 * east-positive seconds here, in one place.
 * Implements FR3 of add-zone-rules-from-iana (design D4).
 */
import {
  DAYS_PER_WEEK,
  DAYS_PER_YEAR_WITHOUT_LEAP_DAY,
  FUTURE_RULE_DEFAULT_TRANSITION_SECONDS,
  FUTURE_RULE_MAX_TRANSITION_HOURS,
  FUTURE_RULE_MIN_DESIGNATION_LENGTH,
  MAX_WEEK_OF_MONTH,
  MONTHS_PER_YEAR,
  RuleDateKind,
  SECONDS_PER_HOUR,
  SECONDS_PER_MINUTE,
} from "./zoneRulesConstants.ts";

export type FutureRuleType = { designation: string; offsetSeconds: number };

export type RuleDate =
  | {
      kind: typeof RuleDateKind.JULIAN_NO_LEAP | typeof RuleDateKind.ZERO_BASED;
      day: number;
      timeSeconds: number;
    }
  | {
      kind: typeof RuleDateKind.MONTH_WEEK_DAY;
      month: number;
      week: number;
      weekday: number;
      timeSeconds: number;
    };

/** The zone's rule after its last listed clock change. */
export type FutureRule = {
  standard: FutureRuleType;
  daylight?: FutureRuleType & { start: RuleDate; end: RuleDate };
};

type DayRule = RuleDate extends infer Date
  ? Date extends unknown
    ? Omit<Date, "timeSeconds">
    : never
  : never;

type Read<Value> = { value: Value; rest: string };

const ANGLE_BRACKET_DESIGNATION = /^<([A-Za-z0-9+-]*)>/;
const LETTERS_DESIGNATION = /^[A-Za-z]+/;
const CLOCK_TIME = /^([+-]?)(\d{1,3})(?::(\d{1,2}))?(?::(\d{1,2}))?/;
const DAY_NUMBER = /^(J?)(\d{1,3})/;
const MONTH_WEEK_DAY = /^M(\d{1,2})\.(\d)\.(\d)/;
const TIME_SEPARATOR = "/";
const RULE_SEPARATOR = ",";
const NEGATIVE_SIGN = "-";
const MAX_MINUTES_OR_SECONDS = SECONDS_PER_MINUTE - 1;
const FIRST_DAY_OF_YEAR = 1;
const LAST_WEEKDAY = DAYS_PER_WEEK - 1;
const DAYLIGHT_SAVING_STEP_SECONDS = SECONDS_PER_HOUR;

function readDesignation(text: string): Read<string> | undefined {
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
function readClockTime(text: string): Read<number> | undefined {
  const match = CLOCK_TIME.exec(text);
  if (!match) return undefined;
  const [consumed, sign, hours, minutes = "0", seconds = "0"] = match;
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

function readDayRule(text: string): Read<DayRule> | undefined {
  const monthWeekDay = MONTH_WEEK_DAY.exec(text);
  if (monthWeekDay) {
    const month = Number(monthWeekDay[1]);
    const week = Number(monthWeekDay[2]);
    const weekday = Number(monthWeekDay[3]);
    const isInRange =
      month >= 1 &&
      month <= MONTHS_PER_YEAR &&
      week >= 1 &&
      week <= MAX_WEEK_OF_MONTH &&
      weekday <= LAST_WEEKDAY;
    return isInRange
      ? {
          value: {
            kind: RuleDateKind.MONTH_WEEK_DAY,
            month,
            week,
            weekday,
          },
          rest: text.slice(monthWeekDay[0].length),
        }
      : undefined;
  }
  const dayNumber = DAY_NUMBER.exec(text);
  if (!dayNumber) return undefined;
  const isJulian = dayNumber[1] !== "";
  const day = Number(dayNumber[2]);
  const isInRange = isJulian
    ? day >= FIRST_DAY_OF_YEAR && day <= DAYS_PER_YEAR_WITHOUT_LEAP_DAY
    : day <= DAYS_PER_YEAR_WITHOUT_LEAP_DAY;
  return isInRange
    ? {
        value: {
          kind: isJulian
            ? RuleDateKind.JULIAN_NO_LEAP
            : RuleDateKind.ZERO_BASED,
          day,
        },
        rest: text.slice(dayNumber[0].length),
      }
    : undefined;
}

function readRuleDate(text: string): Read<RuleDate> | undefined {
  const dayRule = readDayRule(text);
  if (!dayRule) return undefined;
  if (!dayRule.rest.startsWith(TIME_SEPARATOR)) {
    return {
      value: {
        ...dayRule.value,
        timeSeconds: FUTURE_RULE_DEFAULT_TRANSITION_SECONDS,
      } as RuleDate,
      rest: dayRule.rest,
    };
  }
  const time = readClockTime(dayRule.rest.slice(TIME_SEPARATOR.length));
  return time
    ? {
        value: { ...dayRule.value, timeSeconds: time.value } as RuleDate,
        rest: time.rest,
      }
    : undefined;
}

/** A designation followed by its POSIX offset, negated to east-positive seconds. */
function readFutureRuleType(text: string): Read<FutureRuleType> | undefined {
  const designation = readDesignation(text);
  const offset = designation && readClockTime(designation.rest);
  if (!designation || !offset) return undefined;
  return {
    value: { designation: designation.value, offsetSeconds: 0 - offset.value },
    rest: offset.rest,
  };
}

function readDaylightType(
  text: string,
  standard: FutureRuleType,
): Read<FutureRuleType> | undefined {
  const designation = readDesignation(text);
  if (!designation) return undefined;
  const offset = readClockTime(designation.rest);
  return {
    value: {
      designation: designation.value,
      offsetSeconds: offset
        ? 0 - offset.value
        : standard.offsetSeconds + DAYLIGHT_SAVING_STEP_SECONDS,
    },
    rest: offset ? offset.rest : designation.rest,
  };
}

/** The rule of a TZif footer, or `undefined` when the text is not a valid rule. */
export function parseFutureRule(text: string): FutureRule | undefined {
  const standard = readFutureRuleType(text);
  if (!standard) return undefined;
  if (standard.rest === "") return { standard: standard.value };
  const daylightType = readDaylightType(standard.rest, standard.value);
  if (!daylightType?.rest.startsWith(RULE_SEPARATOR)) return undefined;
  const start = readRuleDate(daylightType.rest.slice(RULE_SEPARATOR.length));
  if (!start?.rest.startsWith(RULE_SEPARATOR)) return undefined;
  const end = readRuleDate(start.rest.slice(RULE_SEPARATOR.length));
  if (end?.rest !== "") return undefined;
  return {
    standard: standard.value,
    daylight: { ...daylightType.value, start: start.value, end: end.value },
  };
}
