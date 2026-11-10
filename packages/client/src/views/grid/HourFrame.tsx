import { HourGridCssVariable } from "@/constants";

type HourFrameProps = {
  /** The column of the framed hour cell. */
  hourFrameIndex: number;
};

/**
 * The hour frame: one accent-coloured frame across all rows of the panel
 * around the column of the shown moment. Lies above the hour cells and
 * behind the header texts and row notes (their boxes are `z-grid-box`), takes no
 * pointer events and is hidden from assistive technology.
 * Implements FR8, FR10, UX2 of add-grid-hour-cells-and-hour-frame (D5).
 * Implements FR6, FR7 of fix-grid-meeting-range-lock-and-layering (D5).
 */
export function HourFrame({ hourFrameIndex }: HourFrameProps) {
  return (
    <li
      aria-hidden="true"
      data-hour-frame-index={hourFrameIndex}
      className="pointer-events-none absolute bottom-1 top-1 z-grid-frame box-border rounded-lg border-2 border-accent"
      style={{
        left: `calc(var(${HourGridCssVariable.ROW_PADDING}) + ${hourFrameIndex} * var(${HourGridCssVariable.CELL_PITCH}))`,
        width: `var(${HourGridCssVariable.CELL_PITCH})`,
      }}
    />
  );
}
