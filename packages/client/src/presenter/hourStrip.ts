import {
  HOUR_CELL_MINUTE_DIGITS,
  HOUR_CELL_MINUTE_SEPARATOR,
  SHORT_MONTH_TRAILING_STOP,
  TWELVE_HOUR_WRAP,
} from "@/constants";
import type { InterfaceLanguageCode } from "@/locales";
import {
  type DayPeriod,
  getHourCells,
  type HourCell,
  type ReferenceDay,
} from "@/model";
import { HourFormat } from "@/preferences";
import { DateTimeLabelKind, getDateTimeFormatter } from "./dateTimeFormatters";
import { getDayPeriodMarkers } from "./dayPeriodMarkers";

/**
 * Hour strip of one grid row: the texts of its hour cells (local start hour,
 * minutes, 12-hour marker, midnight month over day). Cached per day, language
 * and hour format so a minute tick re-presents nothing.
 * Implements FR3, FR4, FR5, NFR-P1 of add-grid-hour-cells-and-hour-frame (D2).
 */

export type PresentedHourCell = {
  /** The start instant of the cell as an ISO string. */
  key: string;
  hourText: string;
  /** `:30`, `:45` or an empty text. */
  minuteText: string;
  /** `AM` / `PM` in the 12-hour format, empty in the 24-hour one. */
  dayPeriodMarker: string;
  dayPeriod: DayPeriod;
  hasOffsetEdge: boolean;
  midnightMarker?: { monthText: string; dayText: string };
};

export type PresentedHourStrip = { cells: readonly PresentedHourCell[] };

export type HourStripContext = {
  day: ReferenceDay;
  referenceZoneId: string;
  language: InterfaceLanguageCode;
  hourFormat: HourFormat;
};

const MONTH_PART_TYPE = "month";
const DAY_PART_TYPE = "day";
const NO_TEXT = "";

let cachedStripsKey: string | undefined;
let cachedStripsByZone = new Map<string, PresentedHourStrip>();

function readDatePart(parts: Intl.DateTimeFormatPart[], type: string): string {
  return parts.find((part) => part.type === type)?.value ?? NO_TEXT;
}

function presentMidnightMarker(
  cell: HourCell,
  timeZoneId: string,
  { language, hourFormat }: HourStripContext,
): PresentedHourCell["midnightMarker"] {
  if (cell.midnightDate === undefined) return undefined;
  const parts = getDateTimeFormatter(
    language,
    timeZoneId,
    DateTimeLabelKind.LOCAL_DATE,
    hourFormat,
  ).formatToParts(cell.localStart.epochMilliseconds);
  return {
    monthText: readDatePart(parts, MONTH_PART_TYPE)
      .replace(SHORT_MONTH_TRAILING_STOP, NO_TEXT)
      .toLocaleUpperCase(language),
    dayText: readDatePart(parts, DAY_PART_TYPE),
  };
}

function presentHourCell(
  cell: HourCell,
  timeZoneId: string,
  context: HourStripContext,
): PresentedHourCell {
  const { hour, minute } = cell.localStart;
  const isTwelveHour = context.hourFormat === HourFormat.H12;
  const markers = getDayPeriodMarkers(context.language);
  const midnightMarker = presentMidnightMarker(cell, timeZoneId, context);
  return {
    key: cell.start.toString(),
    hourText: String(
      isTwelveHour ? hour % TWELVE_HOUR_WRAP || TWELVE_HOUR_WRAP : hour,
    ),
    minuteText:
      minute === 0
        ? NO_TEXT
        : `${HOUR_CELL_MINUTE_SEPARATOR}${String(minute).padStart(HOUR_CELL_MINUTE_DIGITS, "0")}`,
    dayPeriodMarker: isTwelveHour
      ? hour < TWELVE_HOUR_WRAP
        ? markers.am
        : markers.pm
      : NO_TEXT,
    dayPeriod: cell.dayPeriod,
    hasOffsetEdge: cell.hasOffsetEdge,
    ...(midnightMarker ? { midnightMarker } : {}),
  };
}

export function presentHourStrip(
  timeZoneId: string,
  context: HourStripContext,
): PresentedHourStrip {
  const stripsKey = [
    context.day.start.epochMilliseconds,
    context.day.end.epochMilliseconds,
    context.referenceZoneId,
    context.language,
    context.hourFormat,
  ].join("|");
  if (stripsKey !== cachedStripsKey) {
    cachedStripsKey = stripsKey;
    cachedStripsByZone = new Map();
  }
  const cachedStrip = cachedStripsByZone.get(timeZoneId);
  if (cachedStrip !== undefined) return cachedStrip;
  const strip = {
    cells: getHourCells(timeZoneId, context.day, context.referenceZoneId).map(
      (cell) => presentHourCell(cell, timeZoneId, context),
    ),
  };
  cachedStripsByZone.set(timeZoneId, strip);
  return strip;
}
