import type { KeyboardEvent } from "react";
import { useTranslation } from "react-i18next";
import {
  HourGridCssVariable,
  MIDNIGHT_SHADE_SPREAD_PX,
  OFFSET_EDGE_WIDTH_PX,
  TRACK_VALUE_MIN_MINUTES,
} from "@/constants";
import type { TrackMove } from "@/controller";
import {
  DayPeriod,
  type PresentedDayTrack,
  type PresentedHourCell,
  type PresentedHourStrip,
} from "@/presenter";
import { DAY_PERIOD_COLOR_VARIABLES, getTrackMoveForKey } from "@/views/shared";

type HourStripProps = {
  city: string;
  /** The row's slider values: the strip is the keyboard time selection of Grid. */
  track: PresentedDayTrack;
  strip: PresentedHourStrip;
  /** The column of the hour frame; its texts are bold. */
  hourFrameIndex: number;
  onMoveTrack: (move: TrackMove) => void;
};

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

function HourCellView({
  cell,
  isFramed,
}: {
  cell: PresentedHourCell;
  isFramed: boolean;
}) {
  const digitClassName = `text-base leading-[1.1] ${isFramed ? "font-bold" : "font-medium"}`;
  const minuteLine = [cell.minuteText, cell.dayPeriodMarker]
    .filter((text) => text !== "")
    .join(" ");
  return (
    <div
      data-hour-cell
      className={`flex h-11 flex-col items-center justify-center gap-px rounded tabular-nums md:h-[38px] lg:h-12 xl:h-[52px] ${
        cell.dayPeriod === DayPeriod.NIGHT
          ? "text-foreground"
          : "text-hour-cell-foreground"
      }`}
      style={{
        backgroundColor: `var(${DAY_PERIOD_COLOR_VARIABLES[cell.dayPeriod]})`,
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

/**
 * The hour strip of a grid row: its hour cells over the reference day, one
 * Tab stop and a slider "Time in {city}" for the keyboard and assistive
 * technology. The cells take no pointer input yet: a tap changes nothing.
 * Implements FR1, FR3, FR4, FR5, FR6, FR8, FR11, FR12, NFR-A1, NFR-A2 of
 * add-grid-hour-cells-and-hour-frame (D4, D6).
 */
export function HourStrip({
  city,
  track,
  strip,
  hourFrameIndex,
  onMoveTrack,
}: HourStripProps) {
  const { t } = useTranslation();
  const handleKeyDown = (event: KeyboardEvent) => {
    const move = getTrackMoveForKey(event.key);
    if (move === undefined) return;
    event.preventDefault();
    onMoveTrack(move);
  };
  return (
    <div
      role="slider"
      tabIndex={0}
      aria-label={t("locations.timeSliderLabel", { city })}
      aria-valuemin={TRACK_VALUE_MIN_MINUTES}
      aria-valuemax={track.maxMinutes}
      aria-valuenow={track.valueMinutes}
      aria-valuetext={track.valueText}
      onKeyDown={handleKeyDown}
      className="grid rounded focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
      style={{
        gridTemplateColumns: `repeat(var(${HourGridCssVariable.CELL_COUNT}), var(${HourGridCssVariable.CELL_PITCH}))`,
      }}
    >
      {strip.cells.map((cell, column) => (
        <HourCellView
          key={cell.key}
          cell={cell}
          isFramed={column === hourFrameIndex}
        />
      ))}
    </div>
  );
}
