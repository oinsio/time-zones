import {
  HourGridCssVariable,
  MEETING_DIMMED_OPACITY_CLASS,
  MIDNIGHT_SHADE_SPREAD_PX,
  OFFSET_EDGE_WIDTH_PX,
} from "@/constants";
import type { PresentedHourCell } from "@/presenter";
import {
  DAY_COLOUR_FOREGROUND_CLASS_NAMES,
  DAY_COLOUR_VARIABLES,
} from "@/views/shared";

const MIDNIGHT_SHADE_SHADOW = `inset 0 0 0 ${MIDNIGHT_SHADE_SPREAD_PX}px var(--color-midnight-shade)`;
const OFFSET_EDGE_SHADOW = `inset ${OFFSET_EDGE_WIDTH_PX}px 0 0 var(--color-foreground)`;
const SHADOW_SEPARATOR = ", ";

function getCellShadow(cell: PresentedHourCell): string | undefined {
  const shadows = [
    cell.midnightMarker ? MIDNIGHT_SHADE_SHADOW : undefined,
    cell.hasOffsetEdge ? OFFSET_EDGE_SHADOW : undefined,
  ].filter((shadow) => shadow !== undefined);
  return shadows.length > 0 ? shadows.join(SHADOW_SEPARATOR) : undefined;
}

type HourCellViewProps = {
  cell: PresentedHourCell;
  isFramed: boolean;
  /** The cell lies outside the meeting range. */
  isDimmed: boolean;
  /** The cell lies inside the meeting frame: a press moves the range. */
  isInFrame?: boolean;
  /** The range is being moved. */
  isMoving?: boolean;
  onClick: () => void;
};

/**
 * One hour cell of a strip: its hour text, day colour, midnight shade
 * and offset edge. A click selects the cell's hour; a cell outside the meeting
 * range is dimmed.
 * Implements FR3, FR5, FR6 of add-grid-hour-cells-and-hour-frame (D6), moved from `HourStrip`.
 * Implements FR5, FR7 of add-grid-meeting-range-and-share (D6): click and dimming.
 * Implements FR12, NFR-A3 of add-day-colouring-setting (D4): the day colour and its digit class.
 * Implements FR15 of move-meeting-range-and-extend-past-midnight (D6): the grab cursor inside the meeting frame.
 */
export function HourCellView({
  cell,
  isFramed,
  isDimmed,
  isInFrame = false,
  isMoving = false,
  onClick,
}: HourCellViewProps) {
  const digitClassName = `text-grid-cell leading-[1.1] ${isFramed ? "font-bold" : "font-medium"}`;
  const minuteLine = [cell.minuteText, cell.dayPeriodMarker]
    .filter((text) => text !== "")
    .join(" ");
  const dimmedClassName = isDimmed ? ` ${MEETING_DIMMED_OPACITY_CLASS}` : "";
  const grabClassName = isInFrame
    ? ` ${isMoving ? "cursor-grabbing" : "cursor-grab"}`
    : "";
  return (
    // biome-ignore lint/a11y/useKeyWithClickEvents: the strip is the keyboard control; its Enter key selects the framed hour
    <div
      data-hour-cell
      onClick={onClick}
      className={`flex h-11 flex-col items-center justify-center gap-px rounded-cell tabular-nums md:h-12 ${
        DAY_COLOUR_FOREGROUND_CLASS_NAMES[cell.dayColour]
      }${dimmedClassName}${grabClassName}`}
      style={{
        backgroundColor: `var(${DAY_COLOUR_VARIABLES[cell.dayColour]})`,
        boxShadow: getCellShadow(cell),
        marginInline: `calc(var(${HourGridCssVariable.CELL_GAP}) / 2)`,
      }}
    >
      {cell.midnightMarker ? (
        <>
          <span className="text-[9px] font-bold leading-none">
            {cell.midnightMarker.monthText}
          </span>
          <span className={digitClassName}>{cell.midnightMarker.dayText}</span>
        </>
      ) : (
        <>
          <span className={digitClassName}>{cell.hourText}</span>
          {minuteLine !== "" && (
            <span className="text-[10px] font-semibold leading-none">
              {minuteLine}
            </span>
          )}
        </>
      )}
    </div>
  );
}
