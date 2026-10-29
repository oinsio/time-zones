import type { TFunction } from "i18next";
import {
  DATE_BAR_LONG_FORMAT_OPTIONS,
  DATE_BAR_SHORT_FORMAT_OPTIONS,
  FULL_DATE_FORMAT_OPTIONS,
} from "@/constants";
import type { SupportedLanguage } from "@/i18n";
import type { Temporal } from "@/lib/temporal";
import { formatWallClockTime } from "./localDateTime";

export type DateBarGap = {
  requestedWallTime: Temporal.PlainTime;
  shownWallTime: Temporal.PlainTime;
};

export type DateBarContext = {
  effectiveDate: Temporal.PlainDate;
  today: Temporal.PlainDate;
  isPinned: boolean;
  gap: DateBarGap | undefined;
  language: SupportedLanguage;
  translate: TFunction;
};

export type PresentedDateBar = {
  /** "Sun, March 8" style label for narrow screens. */
  shortLabel: string;
  /** "Sunday, March 8" style label for wide screens. */
  longLabel: string;
  isoDate: string;
  /** "Sunday, March 8, 2026" for announcements and names. */
  fullDateLabel: string;
  chooseDateLabel: string;
  isPinned: boolean;
  gapNote: string | undefined;
};

const YEAR_FORMAT_OPTIONS: Intl.DateTimeFormatOptions = { year: "numeric" };

/**
 * Texts of the date bar in the interface language; the year is appended when
 * it differs from today's.
 * Implements FR4, FR7, FR9 of select-date-with-calendar-and-now (D4).
 */
export function presentDateBar({
  effectiveDate,
  today,
  isPinned,
  gap,
  language,
  translate,
}: DateBarContext): PresentedDateBar {
  const yearOptions =
    effectiveDate.year === today.year ? {} : YEAR_FORMAT_OPTIONS;
  const fullDateLabel = effectiveDate.toLocaleString(
    language,
    FULL_DATE_FORMAT_OPTIONS,
  );
  const formatTime = (time: Temporal.PlainTime) =>
    formatWallClockTime(time, language);
  return {
    shortLabel: effectiveDate.toLocaleString(language, {
      ...DATE_BAR_SHORT_FORMAT_OPTIONS,
      ...yearOptions,
    }),
    longLabel: effectiveDate.toLocaleString(language, {
      ...DATE_BAR_LONG_FORMAT_OPTIONS,
      ...yearOptions,
    }),
    isoDate: effectiveDate.toString(),
    fullDateLabel,
    chooseDateLabel: translate("date.chooseDate", { date: fullDateLabel }),
    isPinned,
    gapNote: gap
      ? translate("date.gapNote", {
          requestedTime: formatTime(gap.requestedWallTime),
          shownTime: formatTime(gap.shownWallTime),
        })
      : undefined,
  };
}
