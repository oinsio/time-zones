import {
  HOUR_LABEL_FORMAT_OPTIONS_BY_HOUR_FORMAT,
  LOCAL_DATE_FORMAT_OPTIONS,
  LOCAL_TIME_FORMAT_OPTIONS_BY_HOUR_FORMAT,
} from "@/constants";
import type { InterfaceLanguageCode } from "@/locales";
import { HourFormat } from "@/preferences";

export enum DateTimeLabelKind {
  LOCAL_TIME = "localTime",
  LOCAL_DATE = "localDate",
  HOUR = "hour",
}

const FORMAT_OPTIONS_BY_KIND_AND_HOUR_FORMAT: Record<
  DateTimeLabelKind,
  Record<HourFormat, Intl.DateTimeFormatOptions>
> = {
  [DateTimeLabelKind.LOCAL_TIME]: LOCAL_TIME_FORMAT_OPTIONS_BY_HOUR_FORMAT,
  [DateTimeLabelKind.LOCAL_DATE]: {
    [HourFormat.H24]: LOCAL_DATE_FORMAT_OPTIONS,
    [HourFormat.H12]: LOCAL_DATE_FORMAT_OPTIONS,
  },
  [DateTimeLabelKind.HOUR]: HOUR_LABEL_FORMAT_OPTIONS_BY_HOUR_FORMAT,
};

// Stryker disable next-line StringLiteral: equivalent — no language, zone and kind combine to the same joined text
const CACHE_KEY_SEPARATOR = "|";

const formattersByKey = new Map<string, Intl.DateTimeFormat>();

/**
 * One cached formatter per language, zone, label kind and hour format.
 * Building a formatter is the costliest step of presenting a row, so every
 * label shares them. The date label has no hour, so it ignores the hour format.
 * Implements FR1, FR2, FR5 of replace-wall-clock-row-budgets-with-deterministic-checks (D1).
 * Implements FR5, NFR-P1 of add-settings-page-and-device-time-location (D8).
 */
export function getDateTimeFormatter(
  language: InterfaceLanguageCode,
  timeZoneId: string,
  kind: DateTimeLabelKind,
  hourFormat: HourFormat,
): Intl.DateTimeFormat {
  const keyedHourFormat =
    kind === DateTimeLabelKind.LOCAL_DATE ? HourFormat.H24 : hourFormat;
  const cacheKey = [language, timeZoneId, kind, keyedHourFormat].join(
    CACHE_KEY_SEPARATOR,
  );
  const cachedFormatter = formattersByKey.get(cacheKey);
  if (cachedFormatter !== undefined) return cachedFormatter;
  const formatter = new Intl.DateTimeFormat(language, {
    ...FORMAT_OPTIONS_BY_KIND_AND_HOUR_FORMAT[kind][keyedHourFormat],
    timeZone: timeZoneId,
  });
  formattersByKey.set(cacheKey, formatter);
  return formatter;
}
