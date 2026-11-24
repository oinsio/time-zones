/**
 * Digit-count limits of the unit detection with the choice Auto: up to 11
 * digits are seconds, 12-14 milliseconds, 15-17 microseconds, more
 * nanoseconds. Implements FR7 of add-unix-time-converter-tool (D4).
 */
export const UNIX_TIME_SECONDS_MAX_DIGITS = 11;
export const UNIX_TIME_MILLISECONDS_MAX_DIGITS = 14;
export const UNIX_TIME_MICROSECONDS_MAX_DIGITS = 17;

/** The range of `Temporal.Instant`, in whole seconds from 1970 either way. Implements FR15 of add-unix-time-converter-tool (D4). */
export const MAX_UNIX_SECONDS = 8_640_000_000_000;

/** The furthest epoch time, in milliseconds, that `Intl.DateTimeFormat` formats: a local clock reading past it cannot be written. Implements FR15 of add-unix-time-converter-tool (D4). */
export const MAX_FORMATTABLE_EPOCH_MILLISECONDS = 8_640_000_000_000_000;

/** Fraction digits of an exact instant: nanoseconds are the finest unit. */
export const MAX_UNIX_TIME_FRACTION_DIGITS = 9;

export const NANOSECONDS_PER_SECOND = 1_000_000_000;
export const MILLISECONDS_PER_SECOND = 1000;

/** The decimal base of the digits of a Unix time. */
export const DECIMAL_BASE = 10;

/** How long a copy confirmation shows its check icon. Implements FR12, UX5 of add-unix-time-converter-tool (D7). */
export const COPY_CONFIRMATION_MS = 2000;

/** The primary pointer is fine and can hover: a mouse, not a finger. Implements NFR-A2 of add-unix-time-converter-tool (D12). */
export const PRIMARY_POINTER_FINE_HOVER_MEDIA_QUERY =
  "(hover: hover) and (pointer: fine)";
