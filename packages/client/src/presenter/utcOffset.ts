import {
  MINUTES_PER_HOUR,
  UTC_OFFSET_MINUS_SIGN,
  UTC_OFFSET_MINUTES_DIGITS,
  UTC_OFFSET_MINUTES_PAD,
  UTC_OFFSET_MINUTES_SEPARATOR,
  UTC_OFFSET_PLUS_SIGN,
} from "@/constants";

/**
 * "UTC+5:30" style label; the prefix alone for a zero offset; minutes only
 * when not zero; a real minus sign for negative offsets.
 * Implements FR3, UX2 of show-utc-offset-on-location-rows (D2).
 */
export function formatUtcOffset(
  offsetMinutes: number,
  utcPrefix: string,
): string {
  if (offsetMinutes === 0) return utcPrefix;
  const sign = offsetMinutes < 0 ? UTC_OFFSET_MINUS_SIGN : UTC_OFFSET_PLUS_SIGN;
  const absoluteMinutes = Math.abs(offsetMinutes);
  const hours = Math.floor(absoluteMinutes / MINUTES_PER_HOUR);
  const minutes = absoluteMinutes % MINUTES_PER_HOUR;
  const minutesPart =
    minutes === 0
      ? ""
      : `${UTC_OFFSET_MINUTES_SEPARATOR}${String(minutes).padStart(UTC_OFFSET_MINUTES_DIGITS, UTC_OFFSET_MINUTES_PAD)}`;
  return `${utcPrefix}${sign}${hours}${minutesPart}`;
}
