import { MAX_UNIX_TIME_FRACTION_DIGITS } from "@/constants";
import type { Temporal } from "@/lib/temporal";
import type { InterfaceLanguageCode } from "@/locales";
import type { HourFormat } from "@/preferences";
import { DateTimeLabelKind, getDateTimeFormatter } from "../dateTimeFormatters";

const SECOND_PART_TYPE = "second";
const FRACTION_SEPARATOR = ".";

/**
 * The local time of a converter row with seconds and the fraction digits of the
 * moment's precision: the fraction is written after the seconds part of
 * `formatToParts` and before a day period marker, from the cached formatter.
 * Implements FR8, FR9 of add-unix-time-converter-tool (D7).
 */
export function formatExactLocalTime(
  localDateTime: Temporal.ZonedDateTime,
  nanoseconds: number,
  fractionDigitCount: number,
  language: InterfaceLanguageCode,
  hourFormat: HourFormat,
): string {
  const parts = getDateTimeFormatter(
    language,
    localDateTime.timeZoneId,
    DateTimeLabelKind.TIME_WITH_SECONDS,
    hourFormat,
  ).formatToParts(localDateTime.epochMilliseconds);
  const fraction =
    fractionDigitCount > 0
      ? `${FRACTION_SEPARATOR}${String(nanoseconds)
          .padStart(MAX_UNIX_TIME_FRACTION_DIGITS, "0")
          .slice(0, fractionDigitCount)}`
      : "";
  return parts
    .map(({ type, value }) =>
      type === SECOND_PART_TYPE ? `${value}${fraction}` : value,
    )
    .join("");
}
