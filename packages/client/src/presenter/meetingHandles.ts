import {
  getMeetingHandleLimits,
  getMeetingSpan,
  MeetingHandle,
  type MeetingRange,
  type ReferenceDay,
} from "@/model";
import { formatLocalTime } from "./localDateTime";
import type { MeetingPresentationContext } from "./locationMeetingRange";

export type PresentedMeetingHandle = {
  handle: MeetingHandle;
  /** "Meeting start" / "Meeting end": the slider's name. */
  label: string;
  /** Minutes from the reference day's start to this end of the range. */
  valueMinutes: number;
  minMinutes: number;
  maxMinutes: number;
  /** The local time of this end in the reference zone. */
  valueText: string;
};

export type PresentedMeetingHandles = {
  start: PresentedMeetingHandle;
  end: PresentedMeetingHandle;
};

const HANDLE_LABEL_KEYS: Record<MeetingHandle, string> = {
  [MeetingHandle.START]: "meeting.startHandle",
  [MeetingHandle.END]: "meeting.endHandle",
};

/**
 * The two meeting handles as sliders: names, values, limits and value texts.
 * Implements FR12 of add-grid-meeting-range-and-share (D3).
 */
export function presentMeetingHandles(
  day: ReferenceDay,
  meeting: MeetingRange,
  referenceZoneId: string,
  { language, hourFormat, translate }: MeetingPresentationContext,
): PresentedMeetingHandles {
  const { startMinutes, endMinutes } = getMeetingSpan(day, meeting);
  const present = (
    handle: MeetingHandle,
    valueMinutes: number,
    instant: MeetingRange["start"],
  ): PresentedMeetingHandle => ({
    handle,
    label: translate(HANDLE_LABEL_KEYS[handle]),
    valueMinutes,
    ...getMeetingHandleLimits(day, meeting, handle),
    valueText: formatLocalTime(
      instant.toZonedDateTimeISO(referenceZoneId),
      language,
      hourFormat,
    ),
  });
  return {
    start: present(MeetingHandle.START, startMinutes, meeting.start),
    end: present(MeetingHandle.END, endMinutes, meeting.end),
  };
}
