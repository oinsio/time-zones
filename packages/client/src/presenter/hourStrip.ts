import {
  HOUR_CELL_MINUTE_DIGITS,
  HOUR_CELL_MINUTE_SEPARATOR,
  SHORT_MONTH_TRAILING_STOP,
  TWELVE_HOUR_WRAP,
} from "@/constants";
import type { InterfaceLanguageCode } from "@/locales";
import {
  type Coordinates,
  getCoordinatesKey,
  getHourCellCount,
  getHourCells,
  getHourCellWorkingFlags,
  getNextReferenceDay,
  type HourCell,
  type ReferenceDay,
} from "@/model";
import { DayColouring, HourFormat, type WorkingHours } from "@/preferences";
import { DateTimeLabelKind, getDateTimeFormatter } from "./dateTimeFormatters";
import { type DayColour, presentHourCellColour } from "./dayColours";
import { getDayPeriodMarkers } from "./dayPeriodMarkers";

/**
 * Hour strip of one grid row: the texts of its hour cells (local start hour,
 * minutes, 12-hour marker, midnight month over day). Cached per day, language
 * and hour format so a minute tick re-presents nothing.
 * Implements FR3, FR4, FR5, NFR-P1 of add-grid-hour-cells-and-hour-frame (D2).
 * Implements FR11, FR12, NFR-P1 of add-day-colouring-setting (D4).
 * Implements FR6, FR7, NFR-P1 of bind-day-periods-to-sun (D5): cached per zone and coordinates.
 * Implements FR6, FR7, NFR-P1 of move-meeting-range-and-extend-past-midnight (D4): the strip tail,
 * presented cell by cell so a growing tail presents only its new cells.
 */

export type PresentedHourCell = {
  /** The start instant of the cell as an ISO string. */
  key: string;
  hourText: string;
  /** `:30`, `:45` or an empty text. */
  minuteText: string;
  /** `AM` / `PM` in the 12-hour format, empty in the 24-hour one. */
  dayPeriodMarker: string;
  dayColour: DayColour;
  hasOffsetEdge: boolean;
  midnightMarker?: { monthText: string; dayText: string };
};

export type PresentedHourStrip = { cells: readonly PresentedHourCell[] };

/** A strip's presented cells, kept so that a longer tail presents only the cells it adds. */
type CachedStrip = {
  presentedCells: PresentedHourCell[];
  lastTailCellCount: number;
  lastStrip: PresentedHourStrip | undefined;
};

export type HourStripContext = {
  day: ReferenceDay;
  /** The coordinates of the location's sun; `undefined` for a location without day periods. */
  coordinates: Coordinates | undefined;
  referenceZoneId: string;
  language: InterfaceLanguageCode;
  hourFormat: HourFormat;
  dayColouring: DayColouring;
  workingHours: WorkingHours;
  /** The cells of the strip tail after the reference day's cells; none when omitted. */
  tailCellCount?: number;
};

const MONTH_PART_TYPE = "month";
const DAY_PART_TYPE = "day";
const NO_TEXT = "";

let cachedStripsKey: string | undefined;
let cachedStripsByZone = new Map<string, CachedStrip>();

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
  isWorkingCell: boolean,
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
    dayColour: presentHourCellColour(cell, isWorkingCell, context.dayColouring),
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
    context.dayColouring,
    context.workingHours.start,
    context.workingHours.end,
  ].join("|");
  if (stripsKey !== cachedStripsKey) {
    cachedStripsKey = stripsKey;
    cachedStripsByZone = new Map();
  }
  const stripKey = `${timeZoneId}|${getCoordinatesKey(context.coordinates)}`;
  const tailCellCount = context.tailCellCount ?? 0;
  const cachedStrip = cachedStripsByZone.get(stripKey);
  if (
    cachedStrip?.lastStrip &&
    cachedStrip.lastTailCellCount === tailCellCount
  ) {
    return cachedStrip.lastStrip;
  }
  const entry: CachedStrip = cachedStrip ?? {
    presentedCells: [],
    lastTailCellCount: 0,
    lastStrip: undefined,
  };
  const cells = getHourCells(
    timeZoneId,
    context.day,
    context.referenceZoneId,
    context.coordinates,
    tailCellCount,
  );
  const dayCellCount = getHourCellCount(context.day);
  const isWorking = context.dayColouring === DayColouring.WORKING_HOURS;
  const dayFlags = isWorking
    ? getHourCellWorkingFlags(timeZoneId, context.day, context.workingHours)
    : undefined;
  const tailFlags =
    tailCellCount > 0 && isWorking
      ? getHourCellWorkingFlags(
          timeZoneId,
          getNextReferenceDay(context.day, context.referenceZoneId),
          context.workingHours,
        )
      : undefined;
  for (
    let column = entry.presentedCells.length;
    column < cells.length;
    column++
  ) {
    const isWorkingCell =
      column < dayCellCount
        ? (dayFlags?.[column] ?? false)
        : (tailFlags?.[column - dayCellCount] ?? false);
    entry.presentedCells.push(
      presentHourCell(cells[column], isWorkingCell, timeZoneId, context),
    );
  }
  const strip = { cells: entry.presentedCells.slice(0, cells.length) };
  entry.lastTailCellCount = tailCellCount;
  entry.lastStrip = strip;
  cachedStripsByZone.set(stripKey, entry);
  return strip;
}
