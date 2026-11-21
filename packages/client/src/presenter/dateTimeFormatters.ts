import {
  CLOCK_CHANGE_DATE_FORMAT_OPTIONS,
  DATE_WITHOUT_WEEKDAY_FORMAT_OPTIONS,
  DEPLOY_DATE_FORMAT_OPTIONS,
  HOUR_LABEL_FORMAT_OPTIONS_BY_HOUR_FORMAT,
  LOCAL_DATE_FORMAT_OPTIONS,
  LOCAL_TIME_FORMAT_OPTIONS_BY_HOUR_FORMAT,
  WEEKDAY_FORMAT_OPTIONS,
} from "@/constants";
import {
  type InterfaceLanguageCode,
  resolveLanguageFallbacks,
} from "@/locales";
import { HourFormat } from "@/preferences";

export enum DateTimeLabelKind {
  LOCAL_TIME = "localTime",
  LOCAL_DATE = "localDate",
  HOUR = "hour",
  DAY_AND_MONTH = "dayAndMonth",
  DEPLOY_DATE = "deployDate",
  DATE_WITHOUT_WEEKDAY = "dateWithoutWeekday",
  WEEKDAY = "weekday",
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
  [DateTimeLabelKind.DAY_AND_MONTH]: {
    [HourFormat.H24]: CLOCK_CHANGE_DATE_FORMAT_OPTIONS,
    [HourFormat.H12]: CLOCK_CHANGE_DATE_FORMAT_OPTIONS,
  },
  [DateTimeLabelKind.DEPLOY_DATE]: {
    [HourFormat.H24]: DEPLOY_DATE_FORMAT_OPTIONS,
    [HourFormat.H12]: DEPLOY_DATE_FORMAT_OPTIONS,
  },
  [DateTimeLabelKind.DATE_WITHOUT_WEEKDAY]: {
    [HourFormat.H24]: DATE_WITHOUT_WEEKDAY_FORMAT_OPTIONS,
    [HourFormat.H12]: DATE_WITHOUT_WEEKDAY_FORMAT_OPTIONS,
  },
  [DateTimeLabelKind.WEEKDAY]: {
    [HourFormat.H24]: WEEKDAY_FORMAT_OPTIONS,
    [HourFormat.H12]: WEEKDAY_FORMAT_OPTIONS,
  },
};

const HOURLESS_KINDS: readonly DateTimeLabelKind[] = [
  DateTimeLabelKind.LOCAL_DATE,
  DateTimeLabelKind.DAY_AND_MONTH,
  DateTimeLabelKind.DEPLOY_DATE,
  DateTimeLabelKind.DATE_WITHOUT_WEEKDAY,
  DateTimeLabelKind.WEEKDAY,
];

// Stryker disable next-line StringLiteral: equivalent — no language, zone and kind combine to the same joined text
const CACHE_KEY_SEPARATOR = "|";

const formattersByKey = new Map<string, Intl.DateTimeFormat>();

/**
 * One cached formatter per language, zone, label kind and hour format.
 * Building a formatter is the costliest step of presenting a row, so every
 * label shares them. The date labels have no hour, so it ignores the hour format.
 * Implements FR1, FR2, FR5 of replace-wall-clock-row-budgets-with-deterministic-checks (D1).
 * Implements FR5, NFR-P1 of add-settings-page-and-device-time-location (D8).
 * Implements FR5 of polish-settings-and-remove-offline-update-notice (D2): the deploy date kind.
 * Implements FR5 of show-city-labels-in-interface-language (D5): formats along the fallback order.
 * Implements FR7 of add-meeting-share-dialog (D3): the date without weekday and the weekday kinds.
 */
export function getDateTimeFormatter(
  language: InterfaceLanguageCode,
  timeZoneId: string,
  kind: DateTimeLabelKind,
  hourFormat: HourFormat,
): Intl.DateTimeFormat {
  const isHourless = HOURLESS_KINDS.includes(kind);
  const keyedHourFormat = isHourless ? HourFormat.H24 : hourFormat;
  const cacheKey = [language, timeZoneId, kind, keyedHourFormat].join(
    CACHE_KEY_SEPARATOR,
  );
  const cachedFormatter = formattersByKey.get(cacheKey);
  if (cachedFormatter !== undefined) return cachedFormatter;
  const formatter = new Intl.DateTimeFormat(
    [...resolveLanguageFallbacks(language)],
    {
      ...FORMAT_OPTIONS_BY_KIND_AND_HOUR_FORMAT[kind][keyedHourFormat],
      timeZone: timeZoneId,
    },
  );
  formattersByKey.set(cacheKey, formatter);
  return formatter;
}
