import { MEETING_HANDLE_ROW_DIVISOR } from "@/constants";
import { MeetingHandle } from "@/model";

/** The rows, counted from 1 and inclusive, on which a handle can stand. */
export type MeetingHandleCandidateRows = {
  firstRow: number;
  lastRow: number;
};

/**
 * The grid row, counted from 1, a meeting handle stands on: among the
 * candidate rows with two or more, the end handle on the middle one (the upper
 * of two) and the start handle on the next one, so both are easy to grab; with
 * one candidate row both stand on it.
 * Implements FR9, NFR-R1 of add-grid-meeting-range-and-share (D6).
 * Implements FR7 of refine-meeting-range-entry-and-handles (D5).
 */
export function getMeetingHandleRow(
  handle: MeetingHandle,
  { firstRow, lastRow }: MeetingHandleCandidateRows,
): number {
  const candidateCount = lastRow - firstRow + 1;
  const endRow =
    firstRow + Math.ceil(candidateCount / MEETING_HANDLE_ROW_DIVISOR) - 1;
  return handle === MeetingHandle.END ? endRow : Math.min(endRow + 1, lastRow);
}
