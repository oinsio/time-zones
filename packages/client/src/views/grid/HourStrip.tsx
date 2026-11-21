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
import type { MeetingFrameMinutes } from "./meetingFrameHit";
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
  /** The cells of the strip tail at the end of the strip; a gesture starts on none of them. */
  tailCellCount?: number;
  /** The meeting frame, while a meeting range is set: the cells inside it show a grab cursor. */
  meetingFrame?: MeetingFrameMinutes;
  /** The whole range is being moved by a held finger. */
  isFrameMoving?: () => boolean;
  /** The range is being moved: the grabbing cursor. */
  isMoving?: boolean;
  /** A press on a cell of the day begins (`true`) or ends (`false`) a gesture. */
  onSelectionActiveChange?: (isActive: boolean) => void;
  cellPitchPx: number;
  /** The strips scroll horizontally. */
  isScrollable: boolean;
  onMoveTrack: (move: TrackMove) => void;
  onSelectCells: (firstColumn: number, lastColumn: number) => void;
  onSelectFramedHour: () => void;
};

const noop = () => undefined;
const SELECT_KEYS: readonly string[] = [KeyboardKey.ENTER, KeyboardKey.SPACE];

/**
 * The hour strip of a grid row: its hour cells over the reference day, one
 * Tab stop and a slider "Time in {city}" for the keyboard and assistive
 * technology. A tap or a drag on the cells and Enter on the strip set the
 * meeting range; the arrow keys move the time.
 * Implements FR1, FR3, FR4, FR5, FR6, FR8, FR11, FR12, NFR-A1, NFR-A2 of
 * add-grid-hour-cells-and-hour-frame (D4, D6).
 * Implements FR5, FR6, FR7, NFR-A2 of add-grid-meeting-range-and-share (D6).
 * Implements FR6, FR9 of move-meeting-range-and-extend-past-midnight (D4, D10): the tail cells.
 * Implements FR15, FR16 of move-meeting-range-and-extend-past-midnight (D6): the grab cursor inside the frame and no text selection.
 */
export function HourStrip({
  city,
  track,
  strip,
  hourFrameIndex,
  meetingColumns,
  tailCellCount = 0,
  meetingFrame,
  isFrameMoving,
  isMoving = false,
  onSelectionActiveChange = noop,
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
    tailCellCount,
    meetingFrame,
    isFrameMoving,
    onActiveChange: onSelectionActiveChange,
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
        className={`grid rounded focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${panClassName}${meetingFrame ? " select-none [-webkit-touch-callout:none]" : ""}`}
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
            isInFrame={
              meetingColumns !== undefined &&
              column >= meetingColumns.first &&
              column <= meetingColumns.last
            }
            isMoving={isMoving}
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
