import { MEETING_SPAN_SEPARATOR } from "@/constants";
import {
  getLastStartMinutes,
  getMeetingHandleLimits,
  getMeetingSpan,
  type MeetingEndHandle,
  MeetingHandle,
  type MeetingRange,
  type ReferenceDay,
} from "@/model";
import { formatLocalTime } from "./localDateTime";
import type { MeetingPresentationContext } from "./locationMeetingRange";

export type PresentedMeetingHandle<
  Handle extends MeetingHandle = MeetingEndHandle,
> = {
  handle: Handle;
  /** "Meeting start" / "Meeting end" / "Move meeting": the slider's name. */
  label: string;
  /** Minutes from the reference day's start to this end of the range (the move handle: to its start). */
  valueMinutes: number;
  minMinutes: number;
  maxMinutes: number;
  /** The local time of this end in the reference zone (the move handle: the span). */
  valueText: string;
};

export type PresentedMeetingHandles = {
  start: PresentedMeetingHandle;
  end: PresentedMeetingHandle;
  /** Moves the whole range; its value is the start (FR18). */
  move: PresentedMeetingHandle<MeetingHandle.MOVE>;
};

const HANDLE_LABEL_KEYS: Record<MeetingHandle, string> = {
  [MeetingHandle.START]: "meeting.startHandle",
  [MeetingHandle.END]: "meeting.endHandle",
  [MeetingHandle.MOVE]: "meeting.moveHandle",
};

/**
 * The three meeting handles as sliders: names, values, limits and value texts.
 * Implements FR12 of add-grid-meeting-range-and-share (D3).
 * Implements FR18 of move-meeting-range-and-extend-past-midnight (D7): the move handle.
 */
export function presentMeetingHandles(
  day: ReferenceDay,
  meeting: MeetingRange,
  referenceZoneId: string,
  { language, hourFormat, translate }: MeetingPresentationContext,
): PresentedMeetingHandles {
  const { startMinutes, endMinutes } = getMeetingSpan(day, meeting);
  const formatTime = (instant: MeetingRange["start"]) =>
    formatLocalTime(
      instant.toZonedDateTimeISO(referenceZoneId),
      language,
      hourFormat,
    );
  const present = (
    handle: MeetingEndHandle,
    valueMinutes: number,
    instant: MeetingRange["start"],
  ): PresentedMeetingHandle => ({
    handle,
    label: translate(HANDLE_LABEL_KEYS[handle]),
    valueMinutes,
    ...getMeetingHandleLimits(day, meeting, handle),
    valueText: formatTime(instant),
  });
  return {
    start: present(MeetingHandle.START, startMinutes, meeting.start),
    end: present(MeetingHandle.END, endMinutes, meeting.end),
    move: {
      handle: MeetingHandle.MOVE,
      label: translate(HANDLE_LABEL_KEYS[MeetingHandle.MOVE]),
      valueMinutes: startMinutes,
      minMinutes: 0,
      maxMinutes: getLastStartMinutes(day),
      valueText: `${formatTime(meeting.start)}${MEETING_SPAN_SEPARATOR}${formatTime(meeting.end)}`,
    },
  };
}
