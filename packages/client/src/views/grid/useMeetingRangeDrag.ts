import { type PointerEvent, type RefObject, useEffect, useRef } from "react";
import {
  MEETING_HANDLE_AUTO_SCROLL_EDGE_PX,
  MEETING_HANDLE_AUTO_SCROLL_STEP_PX,
  MEETING_HANDLE_RELEASE_CLICK_WINDOW_MS,
  MINUTES_PER_HOUR,
  TRACK_TOUCH_MOVE_LISTENER_OPTIONS,
  TRACK_TOUCH_START_LISTENER_OPTIONS,
  TrackTouchEvent,
} from "@/constants";
import { IS_POINTER_EVENTS_SUPPORTED } from "@/lib/legacy";

export const HOUR_STRIP_SELECTOR = "[data-hour-strip]";

export type MeetingRangeDragOptions = {
  /** The element whose touch events drive the drag where Pointer Events are missing. */
  touchElement: RefObject<HTMLElement | null>;
  /** The panel that holds the hour strips and scrolls them. */
  getPanel: () => HTMLElement | null | undefined;
  /** The pitch of one hour cell in pixels, gap included. */
  cellPitchPx: number;
  /** The strips scroll horizontally, so a drag near the edge scrolls them on. */
  isScrollable: boolean;
  /** The cells of the strip tail; when they change during a drag the drag keeps its target in place. */
  tailCellCount: number;
  /** The minutes the dragged thing stands at; a drag moves it from there by the pointer's travel. */
  valueMinutes: number;
  /** Called with the minutes the pointer points at. */
  onDragTo: (minutes: number) => void;
  onDragActiveChange: (isDragging: boolean) => void;
};

const NO_SCROLL = 0;

/**
 * The drag core of the meeting range: one thing (a handle or the whole range) is
 * dragged by pointer, or by finger through touch events where Pointer Events are
 * missing. The minutes are those at the press plus the pointer's travel since the
 * press, in hour cells of the strip. Within the edge zone of the panel's visible
 * part the panel scrolls on per animation frame and the last pointer position is
 * applied again. When the pitch or the strip tail changes during a drag the press
 * is re-based on the current minutes, so the target does not jump. The release of
 * a drag is never a tap.
 * Implements FR10, FR11, UX2 of add-grid-meeting-range-and-share (D6).
 * Implements FR7, FR8 of refine-meeting-range-entry-and-handles (D5, D7, D8).
 * Implements FR10, FR15, FR16, FR17, FR19 of move-meeting-range-and-extend-past-midnight (D5).
 */
export function useMeetingRangeDrag(options: MeetingRangeDragOptions) {
  const latest = useRef(options);
  latest.current = options;
  const isDragging = useRef(false);
  const lastClientX = useRef(0);
  const frameId = useRef<number | undefined>(undefined);
  const pressMinutes = useRef(0);
  const pressOffsetPx = useRef(0);
  const disarmReleaseClickGuard = useRef<(() => void) | undefined>(undefined);

  const getPanel = () => latest.current.getPanel();

  const applyPointer = (clientX: number) => {
    lastClientX.current = clientX;
    const strip = getPanel()?.querySelector(HOUR_STRIP_SELECTOR);
    if (!strip) return;
    const { cellPitchPx, onDragTo } = latest.current;
    const travelPx =
      clientX - strip.getBoundingClientRect().left - pressOffsetPx.current;
    onDragTo(
      pressMinutes.current + (travelPx / cellPitchPx) * MINUTES_PER_HOUR,
    );
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

  const startDrag = (clientX: number) => {
    const { valueMinutes, onDragActiveChange } = latest.current;
    const strip = getPanel()?.querySelector(HOUR_STRIP_SELECTOR);
    isDragging.current = true;
    lastClientX.current = clientX;
    pressMinutes.current = valueMinutes;
    pressOffsetPx.current = strip
      ? clientX - strip.getBoundingClientRect().left
      : 0;
    onDragActiveChange(true);
  };

  /** The click that ends a drag lands on whatever lies under the finger: it is never a tap. */
  const armReleaseClickGuard = () => {
    disarmReleaseClickGuard.current?.();
    const swallowClick = (event: Event) => {
      event.stopPropagation();
      event.preventDefault();
      disarm();
    };
    const disarm = () => {
      window.clearTimeout(timeoutId);
      window.removeEventListener("click", swallowClick, true);
      disarmReleaseClickGuard.current = undefined;
    };
    const timeoutId = window.setTimeout(
      disarm,
      MEETING_HANDLE_RELEASE_CLICK_WINDOW_MS,
    );
    window.addEventListener("click", swallowClick, true);
    disarmReleaseClickGuard.current = disarm;
  };

  const endDrag = (isRelease: boolean) => {
    if (!isDragging.current) return;
    isDragging.current = false;
    stopAutoScroll();
    latest.current.onDragActiveChange(false);
    if (isRelease) armReleaseClickGuard();
  };

  // biome-ignore lint/correctness/useExhaustiveDependencies: the handlers read the latest options through a ref
  useEffect(() => {
    const element = options.touchElement.current;
    if (IS_POINTER_EVENTS_SUPPORTED || element === null) return;
    const handleStart = (event: TouchEvent) => {
      startDrag(event.changedTouches[0].clientX);
    };
    const handleEnd = (event: TouchEvent) => {
      if (!isDragging.current) return;
      if (event.cancelable) event.preventDefault();
      endDrag(true);
    };
    const handleCancel = () => endDrag(false);
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
    element.addEventListener(
      TrackTouchEvent.END,
      handleEnd,
      TRACK_TOUCH_MOVE_LISTENER_OPTIONS,
    );
    element.addEventListener(TrackTouchEvent.CANCEL, handleCancel);
    return () => {
      endDrag(false);
      element.removeEventListener(TrackTouchEvent.START, handleStart);
      element.removeEventListener(
        TrackTouchEvent.MOVE,
        handleMove,
        TRACK_TOUCH_MOVE_LISTENER_OPTIONS,
      );
      element.removeEventListener(
        TrackTouchEvent.END,
        handleEnd,
        TRACK_TOUCH_MOVE_LISTENER_OPTIONS,
      );
      element.removeEventListener(TrackTouchEvent.CANCEL, handleCancel);
    };
  }, [options.touchElement]);

  useEffect(() => () => disarmReleaseClickGuard.current?.(), []);

  // The pitch or the tail changed under a drag: keep the target where it is.
  // biome-ignore lint/correctness/useExhaustiveDependencies: only a change of the pitch or the tail re-bases the press
  useEffect(() => {
    if (!isDragging.current) return;
    const strip = getPanel()?.querySelector(HOUR_STRIP_SELECTOR);
    pressMinutes.current = latest.current.valueMinutes;
    pressOffsetPx.current = strip
      ? lastClientX.current - strip.getBoundingClientRect().left
      : 0;
  }, [options.cellPitchPx, options.tailCellCount]);

  return {
    startDrag,
    moveTo,
    endDrag,
    isDragging,
    onPointerDown: (event: PointerEvent<HTMLElement>) => {
      startDrag(event.clientX);
      event.currentTarget.setPointerCapture?.(event.pointerId);
    },
    onPointerMove: (event: PointerEvent<HTMLElement>) => {
      if (isDragging.current) moveTo(event.clientX);
    },
    onPointerUp: () => endDrag(true),
    onPointerCancel: () => endDrag(false),
  };
}
