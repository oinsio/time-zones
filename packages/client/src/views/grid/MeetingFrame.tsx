import { HourGridCssVariable, MINUTES_PER_HOUR } from "@/constants";
import type { MeetingSpan } from "@/model";

type MeetingFrameProps = {
  span: MeetingSpan;
};

/**
 * The meeting frame: one meeting-coloured frame across all rows of the panel
 * from the start to the end of the meeting range. Lies above the hour cells
 * and behind the header texts and row notes (their boxes are `z-[2]`), takes no
 * pointer events and is hidden from assistive technology.
 * Implements FR7, UX1 of add-grid-meeting-range-and-share (D6).
 */
export function MeetingFrame({ span }: MeetingFrameProps) {
  const { startMinutes, endMinutes, firstColumn, lastColumn } = span;
  return (
    <li
      aria-hidden="true"
      data-meeting-frame-columns={`${firstColumn}-${lastColumn}`}
      className="pointer-events-none absolute bottom-1 top-1 z-[1] box-border rounded-md border-[3px] border-meeting"
      style={{
        left: `calc(var(${HourGridCssVariable.ROW_PADDING}) + ${startMinutes} / ${MINUTES_PER_HOUR} * var(${HourGridCssVariable.CELL_PITCH}))`,
        width: `calc(${endMinutes - startMinutes} / ${MINUTES_PER_HOUR} * var(${HourGridCssVariable.CELL_PITCH}))`,
      }}
    />
  );
}
