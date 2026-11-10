import type { CSSProperties, ReactNode, RefCallback } from "react";
import type { LocationRow, PresentedLocationMeetingRange } from "@/presenter";

/**
 * What the Grid view hands to the shared view location list: the hour strip
 * of a row, the hour frame, and the panel's ref and style (CSS variables of
 * the hour cell layout). `views/shared` never imports `views/grid`.
 * Implements FR1, FR8, NFR-R2 of add-grid-hour-cells-and-hour-frame (D5).
 * Implements FR7, FR8 of add-grid-meeting-range-and-share (D6, D8).
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
};
