import { Temporal } from "@/lib/temporal";
import type { InterfaceLanguageCode } from "@/locales";
import type { HourFormat, WorkingHours } from "@/preferences";
import { formatWallClockTime } from "./localDateTime";

/**
 * The texts of the working hours fields: a wall time written the way the app
 * writes local times everywhere, in the chosen hour format.
 * Implements FR5 of add-day-colouring-setting (D5).
 */

export type WorkingHoursTexts = { startText: string; endText: string };

/** `10:00` or `10:00 AM`, `09:07` or `9:07 AM`. */
export function formatWorkingHoursTime(
  wallTime: string,
  language: InterfaceLanguageCode,
  hourFormat: HourFormat,
): string {
  return formatWallClockTime(
    Temporal.PlainTime.from(wallTime),
    language,
    hourFormat,
  );
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
