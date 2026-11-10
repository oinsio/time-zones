import type { CSSProperties, ReactNode, RefCallback } from "react";
import type { MeetingRangeInputOutcome } from "@/controller";
import type { LocationRow, PresentedLocationMeetingRange } from "@/presenter";

/**
 * Confirms the meeting range typed in the row `locationId`; `date` is the
 * local ISO date the row showed when the input opened.
 */
export type ConfirmMeetingRange = (
  locationId: string,
  startText: string,
  endText: string,
  date: string,
) => MeetingRangeInputOutcome;

/**
 * What the Grid view hands to the shared view location list: the hour strip
 * of a row, the hour frame, and the panel's ref and style (CSS variables of
 * the hour cell layout). `views/shared` never imports `views/grid`.
 * Implements FR1, FR8, NFR-R2 of add-grid-hour-cells-and-hour-frame (D5).
 * Implements FR7, FR8 of add-grid-meeting-range-and-share (D6, D8).
 * Implements FR1, FR2 of fix-grid-meeting-range-lock-and-layering (D1): `areRowControlsLocked`.
 * Implements FR4 of fix-grid-meeting-range-lock-and-layering (D4): `onConfirmMeetingRange`.
 */
export type HourGridSlots = {
  renderHourStrip: (row: LocationRow) => ReactNode;
  /** The meeting frame and handles while a meeting range is set, else the hour frame. */
  frame: ReactNode;
  /** The meeting range's local span of a row; `undefined` without a meeting range. */
  meetingRangeOf?: (
    row: LocationRow,
  ) => PresentedLocationMeetingRange | undefined;
  panelRef: RefCallback<HTMLUListElement>;
  panelStyle: CSSProperties;
  /** Whether the drag handle, location menu and wall-time input of every row are locked: while a meeting range is set. */
  areRowControlsLocked: boolean;
  /** Confirms the meeting range typed in the row `locationId`; `date` is the local ISO date the row showed when the input opened. */
  onConfirmMeetingRange?: ConfirmMeetingRange;
};
