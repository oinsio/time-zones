import { type KeyboardEvent, useId } from "react";
import { useTranslation } from "react-i18next";
import {
  HourGridCssVariable,
  KeyboardKey,
  TRACK_VALUE_MIN_MINUTES,
} from "@/constants";
import type { TrackMove } from "@/controller";
import type { PresentedDayTrack, PresentedHourStrip } from "@/presenter";
import { getTrackMoveForKey } from "@/views/shared";
import { HourCellView } from "./HourCellView";
import { useHourCellSelection } from "./useHourCellSelection";

type HourStripProps = {
  city: string;
  /** The row's slider values: the strip is the keyboard time selection of Grid. */
  track: PresentedDayTrack;
  strip: PresentedHourStrip;
  /** The column of the hour frame, whose texts are bold; none while a meeting range is set. */
  hourFrameIndex?: number;
  /** The columns the meeting range overlaps; the other cells are dimmed. */
  meetingColumns?: { first: number; last: number };
  cellPitchPx: number;
  /** The strips scroll horizontally. */
  isScrollable: boolean;
  onMoveTrack: (move: TrackMove) => void;
  onSelectCells: (firstColumn: number, lastColumn: number) => void;
  onSelectFramedHour: () => void;
};

const SELECT_KEYS: readonly string[] = [KeyboardKey.ENTER, KeyboardKey.SPACE];

/**
 * The hour strip of a grid row: its hour cells over the reference day, one
 * Tab stop and a slider "Time in {city}" for the keyboard and assistive
 * technology. A tap or a drag on the cells and Enter on the strip set the
 * meeting range; the arrow keys move the time.
 * Implements FR1, FR3, FR4, FR5, FR6, FR8, FR11, FR12, NFR-A1, NFR-A2 of
 * add-grid-hour-cells-and-hour-frame (D4, D6).
 * Implements FR5, FR6, FR7, NFR-A2 of add-grid-meeting-range-and-share (D6).
 */
export function HourStrip({
  city,
  track,
  strip,
  hourFrameIndex,
  meetingColumns,
  cellPitchPx,
  isScrollable,
  onMoveTrack,
  onSelectCells,
  onSelectFramedHour,
}: HourStripProps) {
  const { t } = useTranslation();
  const hintId = useId();
  const selection = useHourCellSelection({
    cellCount: strip.cells.length,
    cellPitchPx,
    isScrollable,
    onSelectCells,
  });
  const handleKeyDown = (event: KeyboardEvent) => {
    if (SELECT_KEYS.includes(event.key)) {
      event.preventDefault();
      onSelectFramedHour();
      return;
    }
    const move = getTrackMoveForKey(event.key);
    if (move === undefined) return;
    event.preventDefault();
    onMoveTrack(move);
  };
  const panClassName = isScrollable ? "touch-pan-x touch-pan-y" : "touch-pan-y";
  return (
    <>
      <div
        ref={selection.stripRef}
        role="slider"
        tabIndex={0}
        aria-label={t("locations.timeSliderLabel", { city })}
        data-hour-strip
        aria-describedby={hintId}
        aria-valuemin={TRACK_VALUE_MIN_MINUTES}
        aria-valuemax={track.maxMinutes}
        aria-valuenow={track.valueMinutes}
        aria-valuetext={track.valueText}
        onKeyDown={handleKeyDown}
        onPointerDown={selection.onPointerDown}
        onPointerMove={selection.onPointerMove}
        onPointerUp={selection.onPointerUp}
        onPointerCancel={selection.onPointerCancel}
        className={`grid rounded focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${panClassName}`}
        style={{
          gridTemplateColumns: `repeat(var(${HourGridCssVariable.CELL_COUNT}), var(${HourGridCssVariable.CELL_PITCH}))`,
        }}
      >
        {strip.cells.map((cell, column) => (
          <HourCellView
            key={cell.key}
            cell={cell}
            isFramed={column === hourFrameIndex}
            isDimmed={
              meetingColumns !== undefined &&
              (column < meetingColumns.first || column > meetingColumns.last)
            }
            onClick={() => selection.onCellClick(column)}
          />
        ))}
      </div>
      <span id={hintId} hidden>
        {t("meeting.hourStripHint")}
      </span>
    </>
  );
}
