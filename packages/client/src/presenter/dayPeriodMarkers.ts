import {
  MILLISECONDS_PER_MINUTE,
  MINUTES_PER_HOUR,
  TWELVE_HOUR_WRAP,
  UTC_ZONE_ID,
} from "@/constants";
import type { InterfaceLanguageCode } from "@/locales";
import { HourFormat } from "@/preferences";
import { DateTimeLabelKind, getDateTimeFormatter } from "./dateTimeFormatters";

/** The texts a language writes for before noon and after noon in the 12-hour format. */
export type DayPeriodMarkers = { am: string; pm: string };

const DAY_PERIOD_PART_TYPE = "dayPeriod";
const NO_MARKER = "";

const markersByLanguage = new Map<InterfaceLanguageCode, DayPeriodMarkers>();

function readMarker(language: InterfaceLanguageCode, hour: number): string {
  const parts = getDateTimeFormatter(
    language,
    UTC_ZONE_ID,
    DateTimeLabelKind.LOCAL_TIME,
    HourFormat.H12,
  ).formatToParts(hour * MINUTES_PER_HOUR * MILLISECONDS_PER_MINUTE);
  return (
    parts.find((part) => part.type === DAY_PERIOD_PART_TYPE)?.value ?? NO_MARKER
  );
}

/**
 * The day-period markers the 12-hour format writes in a language, read from
 * the same formatter that writes times, so a shown time is accepted unchanged.
 * Memoized per language.
 * Implements FR6 of add-settings-page-and-device-time-location (D9).
 */
export function getDayPeriodMarkers(
  language: InterfaceLanguageCode,
): DayPeriodMarkers {
  const cachedMarkers = markersByLanguage.get(language);
  if (cachedMarkers !== undefined) return cachedMarkers;
  const markers = {
    am: readMarker(language, 0),
    pm: readMarker(language, TWELVE_HOUR_WRAP),
  };
  markersByLanguage.set(language, markers);
  return markers;
}
