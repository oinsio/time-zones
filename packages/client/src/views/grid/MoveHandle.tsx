import { type KeyboardEvent, useRef } from "react";
import { MoveHandleCssVariable } from "@/constants";
import type { TrackMove } from "@/controller";
import type { MeetingHandle } from "@/model";
import type { PresentedMeetingHandle } from "@/presenter";
import { getTrackMoveForKey } from "@/views/shared";
import { useMeetingRangeDrag } from "./useMeetingRangeDrag";
import { useMoveHandlePlacement } from "./useMoveHandlePlacement";

type MoveHandleSliderProps = {
  presented: PresentedMeetingHandle<MeetingHandle.MOVE>;
  cellPitchPx: number;
  isScrollable: boolean;
  tailCellCount: number;
  /** The whole range is being moved, by the handle or by the frame: the lifted look. */
  isMoving: boolean;
  onMoveMeeting: (move: TrackMove) => void;
  onDragMeetingTo: (startMinutes: number) => void;
  /** Called with `true` when a drag by the handle starts and with `false` when it ends. */
  onDragActiveChange: (isDragging: boolean) => void;
};

/**
 * The move handle: a slider on the top line of the meeting frame that moves the
 * whole meeting range. `fixed` so that it can lie over the meeting bar; a DOM
 * child of the panel, the last one, so it is the Tab stop after the end handle.
 * A grip of 36 by 12 px in a hit area of 48 by 44 px.
 * Implements FR17, FR18, FR19, NFR-A1, NFR-A2, UX1, UX2, UX3 of
 * move-meeting-range-and-extend-past-midnight (D7, D8, D11).
 */
export function MoveHandleSlider({
  presented,
  cellPitchPx,
  isScrollable,
  tailCellCount,
  isMoving,
  onMoveMeeting,
  onDragMeetingTo,
  onDragActiveChange,
}: MoveHandleSliderProps) {
  const itemElement = useRef<HTMLLIElement | null>(null);
  const drag = useMeetingRangeDrag({
    touchElement: itemElement,
    getPanel: () => itemElement.current?.parentElement,
    cellPitchPx,
    isScrollable,
    tailCellCount,
    valueMinutes: presented.valueMinutes,
    onDragTo: onDragMeetingTo,
    onDragActiveChange,
  });
  useMoveHandlePlacement(itemElement, presented.valueText);

  const handleKeyDown = (event: KeyboardEvent) => {
    const move = getTrackMoveForKey(event.key);
    if (move === undefined) return;
    event.preventDefault();
    onMoveMeeting(move);
  };

  return (
    <li
      ref={itemElement}
      data-meeting-handle={presented.handle}
      data-moving={isMoving ? "" : undefined}
      className="group fixed z-move-handle h-11 w-12 -translate-x-1/2 -translate-y-1/2"
      style={{
        left: `var(${MoveHandleCssVariable.CENTRE_X})`,
        top: `var(${MoveHandleCssVariable.CENTRE_Y})`,
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
        className="flex h-full w-full cursor-grab touch-none items-center justify-center rounded focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent group-data-[moving]:cursor-grabbing"
      >
        <span className="h-3 w-9 rounded bg-meeting group-data-[moving]:h-3.5 group-data-[moving]:w-11 group-data-[moving]:shadow-meeting-lift" />
      </div>
    </li>
  );
}
