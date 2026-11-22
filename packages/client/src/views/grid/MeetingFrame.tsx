import { HourGridCssVariable, MINUTES_PER_HOUR } from "@/constants";
import type { MeetingSpan } from "@/model";

type MeetingFrameProps = {
  span: MeetingSpan;
  /** The whole range is being moved: the lifted look. */
  isMoving?: boolean;
};

/**
 * The meeting frame: one meeting-coloured frame across all rows of the panel
 * from the start to the end of the meeting range. Lies above the hour cells
 * and behind the header texts and row notes (their boxes are `z-grid-box`), takes no
 * pointer events and is hidden from assistive technology.
 * Implements FR7, UX1 of add-grid-meeting-range-and-share (D6).
 * Implements FR6, FR7 of fix-grid-meeting-range-lock-and-layering (D5).
 * Implements FR19, UX3 of move-meeting-range-and-extend-past-midnight (D11): the lifted look while moving.
 */
export function MeetingFrame({ span, isMoving = false }: MeetingFrameProps) {
  const { startMinutes, endMinutes, firstColumn, lastColumn } = span;
  return (
    <li
      aria-hidden="true"
      data-meeting-frame-columns={`${firstColumn}-${lastColumn}`}
      data-moving={isMoving ? "" : undefined}
      className="pointer-events-none absolute bottom-1 top-1 z-grid-frame box-border rounded-md border-[3px] border-meeting data-[moving]:shadow-meeting-lift"
      style={{
        left: `calc(var(${HourGridCssVariable.ROW_PADDING}) + ${startMinutes} / ${MINUTES_PER_HOUR} * var(${HourGridCssVariable.CELL_PITCH}))`,
        width: `calc(${endMinutes - startMinutes} / ${MINUTES_PER_HOUR} * var(${HourGridCssVariable.CELL_PITCH}))`,
      }}
    />
  );
}
