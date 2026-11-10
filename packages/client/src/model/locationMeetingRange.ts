import type { Temporal } from "@/lib/temporal";
import { type DayShift, getDayShift } from "./dayShift";
import type { MeetingRange } from "./meetingRange";

export type LocationMeetingRange = {
  localStart: Temporal.ZonedDateTime;
  localEnd: Temporal.ZonedDateTime;
  dayShift: DayShift;
};

/**
 * The range in a location's zone with the day shift of its start.
 * Implements FR8 of add-grid-meeting-range-and-share (D1).
 */
export function getLocationMeetingRange(
  timeZoneId: string,
  meeting: MeetingRange,
  referenceZoneId: string,
): LocationMeetingRange {
  return {
    localStart: meeting.start.toZonedDateTimeISO(timeZoneId),
    localEnd: meeting.end.toZonedDateTimeISO(timeZoneId),
    dayShift: getDayShift(timeZoneId, meeting.start, referenceZoneId),
  };
}
