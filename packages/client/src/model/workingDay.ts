import { WORKING_WEEKDAYS } from "@/constants";
import { Temporal } from "@/lib/temporal";
import type { WorkingHours } from "@/preferences";

// Implements FR8, FR15 of add-day-colouring-setting (D3): the definition of working time.
/** Whether a local date is a working day (Monday to Friday). */
export function isWorkingDay(date: Temporal.PlainDate): boolean {
  return WORKING_WEEKDAYS.includes(date.dayOfWeek);
}

/** Whether the instant is working time at the location: a working day, at or after the start, before the end. */
export function isWorkingTime(
  instant: Temporal.Instant,
  timeZoneId: string,
  workingHours: WorkingHours,
): boolean {
  const local = instant.toZonedDateTimeISO(timeZoneId);
  const time = local.toPlainTime();
  return (
    isWorkingDay(local.toPlainDate()) &&
    Temporal.PlainTime.compare(
      time,
      Temporal.PlainTime.from(workingHours.start),
    ) >= 0 &&
    Temporal.PlainTime.compare(
      time,
      Temporal.PlainTime.from(workingHours.end),
    ) < 0
  );
}
