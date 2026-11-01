import type { TFunction } from "i18next";
import { MINUTES_PER_HOUR } from "@/constants";
import type { SupportedLanguage } from "@/locales";
import {
  type ClockChange,
  ClockChangeDirection,
  ClockChangeTense,
} from "@/model";
import type { HourFormat } from "@/preferences";
import { formatWallClockDate, formatWallClockTime } from "./localDateTime";

const SENTENCE_KEYS: Record<
  ClockChangeTense,
  Record<ClockChangeDirection, string>
> = {
  [ClockChangeTense.PAST]: {
    [ClockChangeDirection.FORWARD]: "locations.clockChangePastForward",
    [ClockChangeDirection.BACK]: "locations.clockChangePastBack",
  },
  [ClockChangeTense.FUTURE]: {
    [ClockChangeDirection.FORWARD]: "locations.clockChangeFutureForward",
    [ClockChangeDirection.BACK]: "locations.clockChangeFutureBack",
  },
};

export type ClockChangeNoteContext = {
  clockChange: ClockChange;
  tense: ClockChangeTense;
  language: SupportedLanguage;
  hourFormat: HourFormat;
  translate: TFunction;
};

/** "1 h", "30 min" or "1 h 30 min": no zero part. */
function presentAmount(amountMinutes: number, translate: TFunction): string {
  const hours = Math.floor(amountMinutes / MINUTES_PER_HOUR);
  const minutes = amountMinutes % MINUTES_PER_HOUR;
  if (hours === 0)
    return translate("locations.clockChangeAmountMinutes", { minutes });
  if (minutes === 0)
    return translate("locations.clockChangeAmountHours", { hours });
  return translate("locations.clockChangeAmountHoursMinutes", {
    hours,
    minutes,
  });
}

/**
 * The clock change note of a row: one sentence with the local date and time
 * of the change, its tense, direction and amount. The one owner of its text.
 * Implements FR2, FR8, UX2 of show-clock-change-note-on-location-cards (D5).
 */
export function presentClockChangeNote({
  clockChange,
  tense,
  language,
  hourFormat,
  translate,
}: ClockChangeNoteContext): string {
  return translate(SENTENCE_KEYS[tense][clockChange.direction], {
    date: formatWallClockDate(
      clockChange.wallClockTime.toPlainDate(),
      language,
    ),
    time: formatWallClockTime(
      clockChange.wallClockTime.toPlainTime(),
      language,
      hourFormat,
    ),
    amount: presentAmount(clockChange.amountMinutes, translate),
  });
}
