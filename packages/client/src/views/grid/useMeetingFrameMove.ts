import { useEffect, useRef } from "react";
import {
  REORDER_POINTER_ACTIVATION_DISTANCE_PX,
  REORDER_TOUCH_ACTIVATION_DELAY_MS,
  REORDER_TOUCH_ACTIVATION_TOLERANCE_PX,
  TOUCH_POINTER_TYPE,
  TRACK_TOUCH_MOVE_LISTENER_OPTIONS,
  TRACK_TOUCH_START_LISTENER_OPTIONS,
  TrackPointerEvent,
  TrackTouchEvent,
} from "@/constants";
import {
  isInsideMeetingFrame,
  type MeetingFrameMinutes,
} from "./meetingFrameHit";
import {
  HOUR_STRIP_SELECTOR,
  useMeetingRangeDrag,
} from "./useMeetingRangeDrag";

type FrameMoveOptions = {
  panelElement: HTMLElement | null;
  /** The meeting frame; without it nothing moves. */
  frame: MeetingFrameMinutes | undefined;
  cellPitchPx: number;
  isScrollable: boolean;
  tailCellCount: number;
  onMoveTo: (startMinutes: number) => void;
  /** Called with `true` when a move starts and with `false` when it ends. */
  onActiveChange: (isMoving: boolean) => void;
};

const NO_TOUCH_ELEMENT = { current: null };

/**
 * Moves the whole meeting range by a press on an hour cell inside the frame:
 * a mouse or pen after `REORDER_POINTER_ACTIVATION_DISTANCE_PX` of travel, a
 * finger after `REORDER_TOUCH_ACTIVATION_DELAY_MS` of holding within
 * `REORDER_TOUCH_ACTIVATION_TOLERANCE_PX`. A finger runs on touch events on
 * every engine: before the hold nothing is cancelled, so a swipe scrolls; after
 * it every `touchmove` is default-prevented, so the browser does not pan. The
 * finger that enters another cell is a cell drag and loses the hold. The
 * travel, scroll and release rules are those of the drag core.
 * Implements FR15, FR16, FR19, FR20 of move-meeting-range-and-extend-past-midnight (D5, D6).
 */
export function useMeetingFrameMove(options: FrameMoveOptions) {
  const { panelElement, frame, cellPitchPx, isScrollable, tailCellCount } =
    options;
  const isMovingRef = useRef(false);
  const latest = useRef(options);
  latest.current = options;
  const core = useMeetingRangeDrag({
    touchElement: NO_TOUCH_ELEMENT,
    getPanel: () => latest.current.panelElement,
    cellPitchPx,
    isScrollable,
    tailCellCount,
    valueMinutes: frame?.startMinutes ?? 0,
    onDragTo: (minutes) => latest.current.onMoveTo(minutes),
    onDragActiveChange: (isMoving) => {
      isMovingRef.current = isMoving;
      latest.current.onActiveChange(isMoving);
    },
  });
  const coreRef = useRef(core);
  coreRef.current = core;
  const hasFrame = frame !== undefined;

  useEffect(() => {
    const panel = panelElement;
    if (panel === null || !hasFrame) return;
    const findPressedStrip = (target: EventTarget | null, clientX: number) => {
      const strip = (target as Element | null)?.closest?.(HOUR_STRIP_SELECTOR);
      if (!strip) return undefined;
      const { cellPitchPx: pitchPx, frame: currentFrame } = latest.current;
      return isInsideMeetingFrame(
        currentFrame,
        strip.getBoundingClientRect().left,
        pitchPx,
        clientX,
      )
        ? strip
        : undefined;
    };

    // Mouse and pen.
    let pressX: number | undefined;
    let isPointerMoving = false;
    let pressedStrip: Element | undefined;
    const handlePointerDown = (event: PointerEvent) => {
      if (event.pointerType === TOUCH_POINTER_TYPE) return;
      pressedStrip = findPressedStrip(event.target, event.clientX);
      pressX = pressedStrip ? event.clientX : undefined;
    };
    const handlePointerMove = (event: PointerEvent) => {
      if (pressX === undefined || event.pointerType === TOUCH_POINTER_TYPE) {
        return;
      }
      if (!isPointerMoving) {
        if (
          Math.abs(event.clientX - pressX) <
          REORDER_POINTER_ACTIVATION_DISTANCE_PX
        ) {
          return;
        }
        isPointerMoving = true;
        pressedStrip?.setPointerCapture?.(event.pointerId);
        coreRef.current.startDrag(pressX);
      }
      coreRef.current.moveTo(event.clientX);
    };
    const handlePointerEnd = (event: PointerEvent) => {
      if (pressX === undefined) return;
      if (isPointerMoving)
        coreRef.current.endDrag(event.type === TrackPointerEvent.UP);
      pressX = undefined;
      isPointerMoving = false;
      pressedStrip = undefined;
    };

    // A finger, by touch events on every engine.
    let holdTimer: number | undefined;
    let isHeld = false;
    let touchStartX = 0;
    let touchStartY = 0;
    let lastTouchX = 0;
    let touchStripLeft = 0;
    let touchPressedColumn = 0;
    const getColumnAt = (clientX: number) =>
      Math.floor((clientX - touchStripLeft) / latest.current.cellPitchPx);
    const clearHold = () => {
      window.clearTimeout(holdTimer);
      holdTimer = undefined;
    };
    const handleTouchStart = (event: TouchEvent) => {
      const touch = event.changedTouches[0];
      clearHold();
      const pressedTouchStrip = findPressedStrip(event.target, touch.clientX);
      if (!pressedTouchStrip) return;
      touchStripLeft = pressedTouchStrip.getBoundingClientRect().left;
      touchPressedColumn = getColumnAt(touch.clientX);
      touchStartX = touch.clientX;
      touchStartY = touch.clientY;
      lastTouchX = touch.clientX;
      holdTimer = window.setTimeout(() => {
        holdTimer = undefined;
        isHeld = true;
        coreRef.current.startDrag(lastTouchX);
      }, REORDER_TOUCH_ACTIVATION_DELAY_MS);
    };
    const handleTouchMove = (event: TouchEvent) => {
      const touch = event.changedTouches[0];
      lastTouchX = touch.clientX;
      if (isHeld) {
        if (event.cancelable) event.preventDefault();
        coreRef.current.moveTo(touch.clientX);
        return;
      }
      if (
        holdTimer !== undefined &&
        (Math.hypot(touch.clientX - touchStartX, touch.clientY - touchStartY) >
          REORDER_TOUCH_ACTIVATION_TOLERANCE_PX ||
          getColumnAt(touch.clientX) !== touchPressedColumn)
      ) {
        clearHold();
      }
    };
    const handleTouchEnd = (event: TouchEvent) => {
      clearHold();
      if (!isHeld) return;
      isHeld = false;
      if (event.cancelable) event.preventDefault();
      coreRef.current.endDrag(event.type === TrackTouchEvent.END);
    };

    panel.addEventListener(TrackPointerEvent.DOWN, handlePointerDown);
    panel.addEventListener(TrackPointerEvent.MOVE, handlePointerMove);
    panel.addEventListener(TrackPointerEvent.UP, handlePointerEnd);
    panel.addEventListener(TrackPointerEvent.CANCEL, handlePointerEnd);
    panel.addEventListener(
      TrackTouchEvent.START,
      handleTouchStart,
      TRACK_TOUCH_START_LISTENER_OPTIONS,
    );
    panel.addEventListener(
      TrackTouchEvent.MOVE,
      handleTouchMove,
      TRACK_TOUCH_MOVE_LISTENER_OPTIONS,
    );
    panel.addEventListener(
      TrackTouchEvent.END,
      handleTouchEnd,
      TRACK_TOUCH_MOVE_LISTENER_OPTIONS,
    );
    panel.addEventListener(TrackTouchEvent.CANCEL, handleTouchEnd);
    return () => {
      clearHold();
      if (isPointerMoving || isHeld) coreRef.current.endDrag(false);
      panel.removeEventListener(TrackPointerEvent.DOWN, handlePointerDown);
      panel.removeEventListener(TrackPointerEvent.MOVE, handlePointerMove);
      panel.removeEventListener(TrackPointerEvent.UP, handlePointerEnd);
      panel.removeEventListener(TrackPointerEvent.CANCEL, handlePointerEnd);
      panel.removeEventListener(TrackTouchEvent.START, handleTouchStart);
      panel.removeEventListener(
        TrackTouchEvent.MOVE,
        handleTouchMove,
        TRACK_TOUCH_MOVE_LISTENER_OPTIONS,
      );
      panel.removeEventListener(
        TrackTouchEvent.END,
        handleTouchEnd,
        TRACK_TOUCH_MOVE_LISTENER_OPTIONS,
      );
      panel.removeEventListener(TrackTouchEvent.CANCEL, handleTouchEnd);
    };
  }, [panelElement, hasFrame]);

  return { isMovingRef };
}
