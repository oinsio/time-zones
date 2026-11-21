import type { PointerEvent, RefObject } from "react";
import type { MeetingEndHandle } from "@/model";
import { useMeetingRangeDrag } from "./useMeetingRangeDrag";

export { HOUR_STRIP_SELECTOR } from "./useMeetingRangeDrag";

type HandleDragOptions = {
  handle: MeetingEndHandle;
  handleElement: RefObject<HTMLElement | null>;
  /** The pitch of one hour cell in pixels, gap included. */
  cellPitchPx: number;
  /** The strips scroll horizontally, so a handle near the edge scrolls them on. */
  isScrollable: boolean;
  /** The cells of the strip tail; a change keeps the dragged end in place. */
  tailCellCount?: number;
  /** The minutes the handle stands at; a drag moves it from there by the pointer's travel. */
  valueMinutes: number;
  onDragHandleTo: (handle: MeetingEndHandle, minutes: number) => void;
  onDragActiveChange: (isDragging: boolean) => void;
};

/**
 * Drags a meeting handle: the drag core with the handle as its target.
 * Implements FR10, FR11, UX2 of add-grid-meeting-range-and-share (D6).
 * Implements FR7, FR8 of refine-meeting-range-entry-and-handles (D5, D7, D8).
 * Implements FR10 of move-meeting-range-and-extend-past-midnight (D5): a thin caller of the drag core.
 */
export function useMeetingHandleDrag({
  handle,
  handleElement,
  cellPitchPx,
  isScrollable,
  tailCellCount = 0,
  valueMinutes,
  onDragHandleTo,
  onDragActiveChange,
}: HandleDragOptions) {
  const drag = useMeetingRangeDrag({
    touchElement: handleElement,
    getPanel: () => handleElement.current?.parentElement,
    cellPitchPx,
    isScrollable,
    tailCellCount,
    valueMinutes,
    onDragTo: (minutes) => onDragHandleTo(handle, minutes),
    onDragActiveChange,
  });
  return {
    onPointerDown: (event: PointerEvent<HTMLElement>) =>
      drag.onPointerDown(event),
    onPointerMove: drag.onPointerMove,
    onPointerUp: drag.onPointerUp,
    onPointerCancel: drag.onPointerCancel,
  };
}
