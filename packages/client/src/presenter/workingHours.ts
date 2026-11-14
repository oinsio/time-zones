import { UTC_ZONE_ID } from "@/constants";
import { Temporal } from "@/lib/temporal";
import type { InterfaceLanguageCode } from "@/locales";
import type { HourFormat, WorkingHours } from "@/preferences";
import { DateTimeLabelKind, getDateTimeFormatter } from "./dateTimeFormatters";

/**
 * The texts of the working hours fields: a wall time written the way the app
 * writes local times everywhere, in the chosen hour format. The wall time is
 * placed on the epoch date, as `getDayPeriodMarkers` reads its markers.
 * Implements FR5 of add-day-colouring-setting (D5).
 */

export type WorkingHoursTexts = { startText: string; endText: string };

const EPOCH_DATE = Temporal.PlainDate.from("1970-01-01");

/** `10:00` or `10:00 AM`, `09:07` or `9:07 AM`. */
export function formatWorkingHoursTime(
  wallTime: string,
  language: InterfaceLanguageCode,
  hourFormat: HourFormat,
): string {
  const instant = EPOCH_DATE.toZonedDateTime({
    timeZone: UTC_ZONE_ID,
    plainTime: wallTime,
  });
  return getDateTimeFormatter(
    language,
    UTC_ZONE_ID,
    DateTimeLabelKind.LOCAL_TIME,
    hourFormat,
  ).format(instant.epochMilliseconds);
}

export function presentWorkingHoursTexts(
  workingHours: WorkingHours,
  language: InterfaceLanguageCode,
  hourFormat: HourFormat,
): WorkingHoursTexts {
  return {
    startText: formatWorkingHoursTime(workingHours.start, language, hourFormat),
    endText: formatWorkingHoursTime(workingHours.end, language, hourFormat),
  };
}
