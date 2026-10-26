import {
  HOUR_LABEL_FORMAT_OPTIONS,
  LOCAL_DATE_FORMAT_OPTIONS,
  LOCAL_TIME_FORMAT_OPTIONS,
} from "@/constants";
import type { SupportedLanguage } from "@/i18n";

export enum DateTimeLabelKind {
  LOCAL_TIME = "localTime",
  LOCAL_DATE = "localDate",
  HOUR = "hour",
}

const FORMAT_OPTIONS_BY_KIND: Record<
  DateTimeLabelKind,
  Intl.DateTimeFormatOptions
> = {
  [DateTimeLabelKind.LOCAL_TIME]: LOCAL_TIME_FORMAT_OPTIONS,
  [DateTimeLabelKind.LOCAL_DATE]: LOCAL_DATE_FORMAT_OPTIONS,
  [DateTimeLabelKind.HOUR]: HOUR_LABEL_FORMAT_OPTIONS,
};

// Stryker disable next-line StringLiteral: equivalent — no language, zone and kind combine to the same joined text
const CACHE_KEY_SEPARATOR = "|";

const formattersByKey = new Map<string, Intl.DateTimeFormat>();

/**
 * One cached formatter per language, zone and label kind. Building a formatter
 * is the costliest step of presenting a row, so every label shares them.
 * Implements FR1, FR2, FR5 of replace-wall-clock-row-budgets-with-deterministic-checks (D1).
 */
export function getDateTimeFormatter(
  language: SupportedLanguage,
  timeZoneId: string,
  kind: DateTimeLabelKind,
): Intl.DateTimeFormat {
  const cacheKey = [language, timeZoneId, kind].join(CACHE_KEY_SEPARATOR);
  const cachedFormatter = formattersByKey.get(cacheKey);
  if (cachedFormatter !== undefined) return cachedFormatter;
  const formatter = new Intl.DateTimeFormat(language, {
    ...FORMAT_OPTIONS_BY_KIND[kind],
    timeZone: timeZoneId,
  });
  formattersByKey.set(cacheKey, formatter);
  return formatter;
}
