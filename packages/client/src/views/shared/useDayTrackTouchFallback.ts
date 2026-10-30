import type { RefObject } from "react";
import { useEffect, useRef } from "react";
import {
  TRACK_TOUCH_MOVE_LISTENER_OPTIONS,
  TRACK_TOUCH_START_LISTENER_OPTIONS,
  TrackTouchEvent,
} from "@/constants";
import { IS_POINTER_EVENTS_SUPPORTED } from "@/lib/legacy";
import { getPointerTrackFraction } from "./dayTrackPointer";
import {
  getTouchGestureDecision,
  TouchGestureDecision,
  type TouchPoint,
} from "./dayTrackTouch";

type FingerGesture = {
  identifier: number;
  start: TouchPoint;
  decision: TouchGestureDecision;
};

const findTouch = (touches: TouchList, identifier: number): Touch | null => {
  for (let index = 0; index < touches.length; index += 1) {
    if (touches[index].identifier === identifier) return touches[index];
  }
  return null;
};

/**
 * A finger drag for engines without Pointer Events (iOS 12), from Touch
 * Events. Adds nothing where Pointer Events exist. Returns a function that
 * tells the click after a drag, which must not select.
 * Implements FR4, UX3 of fix-day-track-drag-continuity-and-smoothness (D3).
 */
export function useDayTrackTouchFallback(
  sliderElement: RefObject<HTMLDivElement | null>,
  barElement: RefObject<HTMLDivElement | null>,
  onSelectFraction: (fraction: number) => void,
  setDragFraction: (fraction: number | null) => void,
): () => boolean {
  const gesture = useRef<FingerGesture | null>(null);
  const isClickAfterDrag = useRef(false);
  const latest = useRef({ onSelectFraction, setDragFraction });
  latest.current = { onSelectFraction, setDragFraction };

  useEffect(() => {
    const slider = sliderElement.current;
    if (IS_POINTER_EVENTS_SUPPORTED || slider === null) return;

    const handleStart = (event: TouchEvent) => {
      if (gesture.current !== null) return;
      const touch = event.changedTouches[0];
      isClickAfterDrag.current = false;
      gesture.current = {
        identifier: touch.identifier,
        start: { x: touch.clientX, y: touch.clientY },
        decision: TouchGestureDecision.WAIT,
      };
    };

    const handleMove = (event: TouchEvent) => {
      const current = gesture.current;
      if (current === null) return;
      const touch = findTouch(event.changedTouches, current.identifier);
      if (touch === null) return;
      if (current.decision === TouchGestureDecision.WAIT) {
        current.decision = getTouchGestureDecision(current.start, {
          x: touch.clientX,
          y: touch.clientY,
        });
      }
      if (current.decision !== TouchGestureDecision.SELECT) return;
      if (event.cancelable) event.preventDefault();
      isClickAfterDrag.current = true;
      if (barElement.current === null) return;
      const fraction = getPointerTrackFraction(
        touch.clientX,
        barElement.current.getBoundingClientRect(),
      );
      if (fraction === null) return;
      latest.current.setDragFraction(fraction);
      latest.current.onSelectFraction(fraction);
    };

    const handleEnd = (event: TouchEvent) => {
      const current = gesture.current;
      if (current === null) return;
      if (findTouch(event.changedTouches, current.identifier) === null) return;
      gesture.current = null;
      latest.current.setDragFraction(null);
    };

    slider.addEventListener(
      TrackTouchEvent.START,
      handleStart,
      TRACK_TOUCH_START_LISTENER_OPTIONS,
    );
    slider.addEventListener(
      TrackTouchEvent.MOVE,
      handleMove,
      TRACK_TOUCH_MOVE_LISTENER_OPTIONS,
    );
    slider.addEventListener(TrackTouchEvent.END, handleEnd);
    slider.addEventListener(TrackTouchEvent.CANCEL, handleEnd);
    return () => {
      slider.removeEventListener(TrackTouchEvent.START, handleStart);
      slider.removeEventListener(
        TrackTouchEvent.MOVE,
        handleMove,
        TRACK_TOUCH_MOVE_LISTENER_OPTIONS,
      );
      slider.removeEventListener(TrackTouchEvent.END, handleEnd);
      slider.removeEventListener(TrackTouchEvent.CANCEL, handleEnd);
    };
  }, [sliderElement, barElement]);

  return () => isClickAfterDrag.current;
}
