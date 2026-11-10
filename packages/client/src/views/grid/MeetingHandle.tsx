import { type KeyboardEvent, useLayoutEffect, useRef, useState } from "react";
import { HourGridCssVariable, MINUTES_PER_HOUR } from "@/constants";
import type { TrackMove } from "@/controller";
import type { MeetingHandle } from "@/model";
import type { PresentedMeetingHandle } from "@/presenter";
import { getTrackMoveForKey } from "@/views/shared";
import {
  getMeetingHandleRow,
  type MeetingHandleCandidateRows,
} from "./meetingHandleRow";
import {
  HOUR_STRIP_SELECTOR,
  useMeetingHandleDrag,
} from "./useMeetingHandleDrag";

type MeetingHandleSliderProps = {
  presented: PresentedMeetingHandle;
  /** The rows a handle may stand on to stay in view. */
  candidateRows: MeetingHandleCandidateRows;
  cellPitchPx: number;
  isScrollable: boolean;
  onMoveHandle: (handle: MeetingHandle, move: TrackMove) => void;
  onDragHandleTo: (handle: MeetingHandle, minutes: number) => void;
  /** Called with `true` when a drag starts and with `false` when it ends. */
  onDragActiveChange: (isDragging: boolean) => void;
};

/** The vertical centre of the row's hour strip within the panel, in pixels. */
function measureStripCentre(
  panel: HTMLElement,
  rowNumber: number,
): number | undefined {
  const strip = panel.querySelectorAll(HOUR_STRIP_SELECTOR)[rowNumber - 1];
  if (strip === undefined) return undefined;
  const stripRect = strip.getBoundingClientRect();
  return (
    stripRect.top -
    panel.getBoundingClientRect().top -
    panel.clientTop +
    stripRect.height / 2
  );
}

/**
 * A meeting handle: a slider standing on the meeting frame's left or right
 * edge over the hour strip of its row. Dragged by pointer or finger, moved by
 * the slider keys. Lies above everything in the panel (`z-meeting-handle`).
 * Implements FR9, FR10, FR12, NFR-A1, NFR-A2, NFR-R1, UX1, UX2 of
 * add-grid-meeting-range-and-share (D6).
 * Implements FR6, FR7 of fix-grid-meeting-range-lock-and-layering (D5).
 * Implements FR7, FR8, NFR-A2, UX2 of refine-meeting-range-entry-and-handles (D5, D6): stands among the visible rows, a 44 by 48 px hit area.
 */
export function MeetingHandleSlider({
  presented,
  candidateRows,
  cellPitchPx,
  isScrollable,
  onMoveHandle,
  onDragHandleTo,
  onDragActiveChange,
}: MeetingHandleSliderProps) {
  const { handle } = presented;
  const itemElement = useRef<HTMLLIElement | null>(null);
  const [centreTopPx, setCentreTopPx] = useState(0);
  const drag = useMeetingHandleDrag({
    handle,
    handleElement: itemElement,
    cellPitchPx,
    isScrollable,
    valueMinutes: presented.valueMinutes,
    onDragHandleTo,
    onDragActiveChange,
  });
  const rowNumber = getMeetingHandleRow(handle, candidateRows);

  // biome-ignore lint/correctness/useExhaustiveDependencies: measured after every render, as the rows can change height
  useLayoutEffect(() => {
    const panel = itemElement.current?.parentElement;
    if (!panel) return;
    const measure = () => {
      const centrePx = measureStripCentre(panel, rowNumber);
      if (centrePx !== undefined) setCentreTopPx(centrePx);
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(panel);
    return () => observer.disconnect();
  });

  const handleKeyDown = (event: KeyboardEvent) => {
    const move = getTrackMoveForKey(event.key);
    if (move === undefined) return;
    event.preventDefault();
    onMoveHandle(handle, move);
  };

  return (
    <li
      ref={itemElement}
      data-meeting-handle={handle}
      className="absolute z-meeting-handle h-12 w-11 -translate-x-1/2 -translate-y-1/2"
      style={{
        left: `calc(var(${HourGridCssVariable.ROW_PADDING}) + ${presented.valueMinutes} / ${MINUTES_PER_HOUR} * var(${HourGridCssVariable.CELL_PITCH}))`,
        top: centreTopPx,
      }}
    >
      <div
        role="slider"
        tabIndex={0}
        aria-label={presented.label}
        aria-valuemin={presented.minMinutes}
        aria-valuemax={presented.maxMinutes}
        aria-valuenow={presented.valueMinutes}
        aria-valuetext={presented.valueText}
        onKeyDown={handleKeyDown}
        onPointerDown={drag.onPointerDown}
        onPointerMove={drag.onPointerMove}
        onPointerUp={drag.onPointerUp}
        onPointerCancel={drag.onPointerCancel}
        className="flex h-full w-full cursor-ew-resize touch-none items-center justify-center rounded focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
      >
        <span className="h-9 w-3 rounded bg-meeting" />
      </div>
    </li>
  );
}
