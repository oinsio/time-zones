import type { TFunction } from "i18next";
import { MEETING_SPAN_SEPARATOR } from "@/constants";
import type { InterfaceLanguageCode } from "@/locales";
import { DayShift, getLocationMeetingRange, type MeetingRange } from "@/model";
import type { HourFormat } from "@/preferences";
import { formatLocalTime } from "./localDateTime";

export type MeetingPresentationContext = {
  language: InterfaceLanguageCode;
  hourFormat: HourFormat;
  translate: TFunction;
};

export type PresentedLocationMeetingRange = {
  /** "09:00": the local start in the hour format. */
  startTimeLabel: string;
  /** "11:00": the local end in the hour format. */
  endTimeLabel: string;
  /** "09:00–11:00": the local start and end in the hour format. */
  spanLabel: string;
  /** "a day earlier" / "a day later"; absent when the local date is the reference zone's. */
  dayShiftLabel?: string;
};

const DAY_SHIFT_KEYS: Record<Exclude<DayShift, DayShift.SAME>, string> = {
  [DayShift.EARLIER]: "locations.dayShiftEarlier",
  [DayShift.LATER]: "locations.dayShiftLater",
};

/**
 * The local span of the meeting range in a location's zone and its day shift
 * mark. Formatters come from the cached `formatLocalTime`.
 * Implements FR8, NFR-P1 of add-grid-meeting-range-and-share (D3).
 * Implements FR3 of fix-grid-meeting-range-lock-and-layering (D4): the two ends.
 */
export function presentLocationMeetingRange(
  timeZoneId: string,
  meeting: MeetingRange,
  referenceZoneId: string,
  { language, hourFormat, translate }: MeetingPresentationContext,
): PresentedLocationMeetingRange {
  const { localStart, localEnd, dayShift } = getLocationMeetingRange(
    timeZoneId,
    meeting,
    referenceZoneId,
  );
  const startTimeLabel = formatLocalTime(localStart, language, hourFormat);
  const endTimeLabel = formatLocalTime(localEnd, language, hourFormat);
  const spanLabel = startTimeLabel + MEETING_SPAN_SEPARATOR + endTimeLabel;
  const presented = { startTimeLabel, endTimeLabel, spanLabel };
  return dayShift === DayShift.SAME
    ? presented
    : { ...presented, dayShiftLabel: translate(DAY_SHIFT_KEYS[dayShift]) };
}
