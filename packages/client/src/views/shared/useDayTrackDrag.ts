import type { MouseEvent, PointerEvent, RefObject } from "react";
import { useEffect, useRef, useState } from "react";
import {
  TOUCH_POINTER_TYPE,
  TRACK_TOUCH_MOVE_LISTENER_OPTIONS,
  TrackTouchEvent,
} from "@/constants";
import { getPointerTrackFraction } from "./dayTrackPointer";
import {
  getTouchGestureDecision,
  TouchGestureDecision,
  type TouchPoint,
} from "./dayTrackTouch";

type TouchGesture = {
  pointerId: number;
  start: TouchPoint;
  decision: TouchGestureDecision;
};

/**
 * The pointer path of a day track: selects while a mouse, pen or finger
 * drags, keeps the drag going wherever the pointer leaves the bar, and holds
 * the dragged handle position (`dragFraction`) until the drag ends.
 * Implements FR1, FR2, FR3, NFR-A1 of fix-day-track-drag-continuity-and-smoothness (D1, D2, D4).
 */
export function useDayTrackDrag(
  sliderElement: RefObject<HTMLDivElement | null>,
  barElement: RefObject<HTMLDivElement | null>,
  onSelectFraction: (fraction: number) => void,
) {
  const touchGesture = useRef<TouchGesture | null>(null);
  const isDragActive = useRef(false);
  const [dragFraction, setDragFraction] = useState<number | null>(null);

  const selectAt = (event: MouseEvent<HTMLDivElement>) => {
    if (barElement.current === null) return;
    const fraction = getPointerTrackFraction(
      event.clientX,
      barElement.current.getBoundingClientRect(),
    );
    if (fraction === null) return;
    onSelectFraction(fraction);
  };

  const dragAt = (event: MouseEvent<HTMLDivElement>) => {
    if (barElement.current === null) return;
    const fraction = getPointerTrackFraction(
      event.clientX,
      barElement.current.getBoundingClientRect(),
    );
    if (fraction === null) return;
    setDragFraction(fraction);
    onSelectFraction(fraction);
  };

  useEffect(() => {
    const slider = sliderElement.current;
    if (slider === null) return;
    const cancelScrollDuringDrag = (event: TouchEvent) => {
      if (isDragActive.current && event.cancelable) event.preventDefault();
    };
    slider.addEventListener(
      TrackTouchEvent.MOVE,
      cancelScrollDuringDrag,
      TRACK_TOUCH_MOVE_LISTENER_OPTIONS,
    );
    return () =>
      slider.removeEventListener(
        TrackTouchEvent.MOVE,
        cancelScrollDuringDrag,
        TRACK_TOUCH_MOVE_LISTENER_OPTIONS,
      );
  }, [sliderElement]);

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType === TOUCH_POINTER_TYPE) {
      touchGesture.current = {
        pointerId: event.pointerId,
        start: { x: event.clientX, y: event.clientY },
        decision: TouchGestureDecision.WAIT,
      };
      return;
    }
    isDragActive.current = true;
    event.currentTarget.setPointerCapture(event.pointerId);
    dragAt(event);
  };

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const gesture = touchGesture.current;
    if (gesture === null || gesture.pointerId !== event.pointerId) {
      if (event.currentTarget.hasPointerCapture(event.pointerId)) {
        dragAt(event);
      }
      return;
    }
    if (gesture.decision === TouchGestureDecision.WAIT) {
      gesture.decision = getTouchGestureDecision(gesture.start, {
        x: event.clientX,
        y: event.clientY,
      });
      if (gesture.decision === TouchGestureDecision.SELECT) {
        isDragActive.current = true;
        event.currentTarget.setPointerCapture(event.pointerId);
      }
    }
    if (gesture.decision === TouchGestureDecision.SELECT) dragAt(event);
  };

  const handlePointerEnd = (event: PointerEvent<HTMLDivElement>) => {
    const gesture = touchGesture.current;
    isDragActive.current = false;
    touchGesture.current = null;
    setDragFraction(null);
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    if (gesture?.decision === TouchGestureDecision.WAIT) selectAt(event);
  };

  const handlePointerCancel = () => {
    isDragActive.current = false;
    touchGesture.current = null;
    setDragFraction(null);
  };

  return {
    dragFraction,
    setDragFraction,
    selectAt,
    handlePointerDown,
    handlePointerMove,
    handlePointerEnd,
    handlePointerCancel,
  };
}
