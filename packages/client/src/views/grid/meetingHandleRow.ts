import { MEETING_HANDLE_ROW_DIVISOR } from "@/constants";
import { MeetingHandle } from "@/model";

/**
 * The grid row, counted from 1, a meeting handle stands on: with two or more
 * rows the end handle on row ⌈rows / 2⌉ and the start handle on the next one,
 * so both are easy to grab; with one row both stand on it.
 * Implements FR9, NFR-R1 of add-grid-meeting-range-and-share (D6).
 */
export function getMeetingHandleRow(
  handle: MeetingHandle,
  rowCount: number,
): number {
  const endRow = Math.ceil(rowCount / MEETING_HANDLE_ROW_DIVISOR);
  return handle === MeetingHandle.END ? endRow : Math.min(endRow + 1, rowCount);
}
