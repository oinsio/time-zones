import { TRACK_TOUCH_SLOP_PX } from "@/constants";

export enum TouchGestureDecision {
  WAIT = "WAIT",
  SELECT = "SELECT",
  ABANDON = "ABANDON",
}

export type TouchPoint = { x: number; y: number };

/**
 * Tells a horizontal drag along the track (select) from a vertical swipe
 * (scroll, abandon) once the finger has left the slop; until then waits.
 * Implements FR3, NFR-R2 of add-time-sliders-to-location-cards (D7).
 */
export function getTouchGestureDecision(
  start: TouchPoint,
  current: TouchPoint,
): TouchGestureDecision {
  const horizontalDistance = Math.abs(current.x - start.x);
  const verticalDistance = Math.abs(current.y - start.y);
  if (
    verticalDistance > TRACK_TOUCH_SLOP_PX &&
    verticalDistance >= horizontalDistance
  ) {
    return TouchGestureDecision.ABANDON;
  }
  if (
    horizontalDistance > TRACK_TOUCH_SLOP_PX &&
    horizontalDistance > verticalDistance
  ) {
    return TouchGestureDecision.SELECT;
  }
  return TouchGestureDecision.WAIT;
}
