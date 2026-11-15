import { HourGridCssVariable } from "@/constants";
import { HourFrameColour } from "@/presenter";

const BORDER_CLASS_NAMES: Record<HourFrameColour, string> = {
  [HourFrameColour.ACCENT]: "border-accent",
  [HourFrameColour.FOREGROUND]: "border-foreground",
};

type HourFrameProps = {
  /** The column of the framed hour cell. */
  hourFrameIndex: number;
  /** The accent frame, or the foreground one where the cells are accent (FR13 of add-day-colouring-setting). */
  colour: HourFrameColour;
};

/**
 * The hour frame: one accent-coloured frame across all rows of the panel
 * around the column of the shown moment. Lies above the hour cells and
 * behind the header texts and row notes (their boxes are `z-grid-box`), takes no
 * pointer events and is hidden from assistive technology.
 * Implements FR8, FR10, UX2 of add-grid-hour-cells-and-hour-frame (D5).
 * Implements FR6, FR7 of fix-grid-meeting-range-lock-and-layering (D5).
 * Implements FR13 of add-day-colouring-setting (D7): the frame colour.
 */
export function HourFrame({ hourFrameIndex, colour }: HourFrameProps) {
  return (
    <li
      aria-hidden="true"
      data-hour-frame-index={hourFrameIndex}
      className={`pointer-events-none absolute bottom-1 top-1 z-grid-frame box-border rounded-lg border-2 ${BORDER_CLASS_NAMES[colour]}`}
      style={{
        left: `calc(var(${HourGridCssVariable.ROW_PADDING}) + ${hourFrameIndex} * var(${HourGridCssVariable.CELL_PITCH}))`,
        width: `var(${HourGridCssVariable.CELL_PITCH})`,
      }}
    />
  );
}
