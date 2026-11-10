import { type PointerEvent, type RefObject, useEffect, useRef } from "react";
import {
  MEETING_HANDLE_AUTO_SCROLL_EDGE_PX,
  MEETING_HANDLE_AUTO_SCROLL_STEP_PX,
  MINUTES_PER_HOUR,
  TRACK_TOUCH_MOVE_LISTENER_OPTIONS,
  TRACK_TOUCH_START_LISTENER_OPTIONS,
  TrackTouchEvent,
} from "@/constants";
import { IS_POINTER_EVENTS_SUPPORTED } from "@/lib/legacy";
import type { MeetingHandle } from "@/model";

export const HOUR_STRIP_SELECTOR = "[data-hour-strip]";

type HandleDragOptions = {
  handle: MeetingHandle;
  handleElement: RefObject<HTMLElement | null>;
  /** The pitch of one hour cell in pixels, gap included. */
  cellPitchPx: number;
  /** The strips scroll horizontally, so a handle near the edge scrolls them on. */
  isScrollable: boolean;
  onDragHandleTo: (handle: MeetingHandle, minutes: number) => void;
};

const NO_SCROLL = 0;

/**
 * Drags a meeting handle by pointer, or by finger through touch events where
 * Pointer Events are missing. The minutes come from the pointer's position over
 * the hour strip, the strip's own rect carrying the scroll. Within the edge zone
 * of the panel's visible part the panel scrolls on per animation frame and the
 * last pointer position is applied again.
 * Implements FR10, FR11, UX2 of add-grid-meeting-range-and-share (D6).
 */
export function useMeetingHandleDrag(options: HandleDragOptions) {
  const latest = useRef(options);
  latest.current = options;
  const isDragging = useRef(false);
  const lastClientX = useRef(0);
  const frameId = useRef<number | undefined>(undefined);

  const getPanel = () => latest.current.handleElement.current?.parentElement;

  const applyPointer = (clientX: number) => {
    lastClientX.current = clientX;
    const strip = getPanel()?.querySelector(HOUR_STRIP_SELECTOR);
    if (!strip) return;
    const { handle, cellPitchPx, onDragHandleTo } = latest.current;
    const offsetPx = clientX - strip.getBoundingClientRect().left;
    onDragHandleTo(handle, (offsetPx / cellPitchPx) * MINUTES_PER_HOUR);
  };

  const getScrollDirection = () => {
    const panel = getPanel();
    if (!panel || !latest.current.isScrollable) return NO_SCROLL;
    const { left, right } = panel.getBoundingClientRect();
    if (lastClientX.current >= right - MEETING_HANDLE_AUTO_SCROLL_EDGE_PX) {
      return 1;
    }
    if (lastClientX.current <= left + MEETING_HANDLE_AUTO_SCROLL_EDGE_PX) {
      return -1;
    }
    return NO_SCROLL;
  };

  const stopAutoScroll = () => {
    if (frameId.current === undefined) return;
    cancelAnimationFrame(frameId.current);
    frameId.current = undefined;
  };

  const scrollFrame = () => {
    frameId.current = undefined;
    const panel = getPanel();
    const direction = getScrollDirection();
    if (!isDragging.current || !panel || direction === NO_SCROLL) return;
    const scrollBefore = panel.scrollLeft;
    panel.scrollLeft += direction * MEETING_HANDLE_AUTO_SCROLL_STEP_PX;
    if (panel.scrollLeft === scrollBefore) return;
    applyPointer(lastClientX.current);
    frameId.current = requestAnimationFrame(scrollFrame);
  };

  const moveTo = (clientX: number) => {
    applyPointer(clientX);
    if (frameId.current === undefined && getScrollDirection() !== NO_SCROLL) {
      frameId.current = requestAnimationFrame(scrollFrame);
    }
  };

  const endDrag = () => {
    isDragging.current = false;
    stopAutoScroll();
  };

  // biome-ignore lint/correctness/useExhaustiveDependencies: the handlers read the latest options through a ref
  useEffect(() => {
    const element = options.handleElement.current;
    if (IS_POINTER_EVENTS_SUPPORTED || element === null) return;
    const handleStart = (event: TouchEvent) => {
      isDragging.current = true;
      lastClientX.current = event.changedTouches[0].clientX;
    };
    const handleMove = (event: TouchEvent) => {
      if (!isDragging.current) return;
      if (event.cancelable) event.preventDefault();
      moveTo(event.changedTouches[0].clientX);
    };
    element.addEventListener(
      TrackTouchEvent.START,
      handleStart,
      TRACK_TOUCH_START_LISTENER_OPTIONS,
    );
    element.addEventListener(
      TrackTouchEvent.MOVE,
      handleMove,
      TRACK_TOUCH_MOVE_LISTENER_OPTIONS,
    );
    element.addEventListener(TrackTouchEvent.END, endDrag);
    element.addEventListener(TrackTouchEvent.CANCEL, endDrag);
    return () => {
      endDrag();
      element.removeEventListener(TrackTouchEvent.START, handleStart);
      element.removeEventListener(
        TrackTouchEvent.MOVE,
        handleMove,
        TRACK_TOUCH_MOVE_LISTENER_OPTIONS,
      );
      element.removeEventListener(TrackTouchEvent.END, endDrag);
      element.removeEventListener(TrackTouchEvent.CANCEL, endDrag);
    };
  }, [options.handleElement]);

  return {
    onPointerDown: (event: PointerEvent<HTMLElement>) => {
      isDragging.current = true;
      lastClientX.current = event.clientX;
      event.currentTarget.setPointerCapture?.(event.pointerId);
    },
    onPointerMove: (event: PointerEvent<HTMLElement>) => {
      if (isDragging.current) moveTo(event.clientX);
    },
    onPointerUp: endDrag,
    onPointerCancel: endDrag,
  };
}
