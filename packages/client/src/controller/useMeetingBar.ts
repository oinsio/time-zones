import type { PresentedMeetingBar } from "@/presenter";
import { useMeetingRange } from "./useMeetingRange";

/**
 * The meeting bar while a meeting range is set, the active view shows the
 * meeting range and the list has rows; `undefined` otherwise.
 * Implements FR13 of add-grid-meeting-range-and-share (D5).
 */
export function useMeetingBar(
  showsMeetingRange: boolean,
): PresentedMeetingBar | undefined {
  const { meeting } = useMeetingRange();
  if (!showsMeetingRange || meeting === undefined) return undefined;
  return meeting.rowRanges.size > 0 ? meeting.bar : undefined;
}
