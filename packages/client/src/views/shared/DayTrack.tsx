import type { KeyboardEvent, PointerEvent } from "react";
import { useRef } from "react";
import { useTranslation } from "react-i18next";
import {
  MAX_TRACK_FRACTION,
  MIN_TRACK_FRACTION,
  TOUCH_POINTER_TYPE,
  TRACK_VALUE_MIN_MINUTES,
} from "@/constants";
import type { TrackMove } from "@/controller";
import type { PresentedDayTrack } from "@/presenter";
import { buildDayTrackGradient, formatPercent } from "./dayTrackGradient";
import { getTrackMoveForKey } from "./dayTrackKeys";
import {
  getTouchGestureDecision,
  TouchGestureDecision,
  type TouchPoint,
} from "./dayTrackTouch";

type DayTrackProps = {
  track: PresentedDayTrack;
  city: string;
  onSelectFraction: (fraction: number) => void;
  onMoveTrack: (move: TrackMove) => void;
};

type TouchGesture = {
  pointerId: number;
  start: TouchPoint;
  decision: TouchGestureDecision;
};

// Stryker disable all: not equivalent — label alignment is layout, untested in jsdom by design (D9), covered by time_selection_layout_e2e.feature
const LABEL_ALIGNMENT_CLASS_NAMES = [
  "",
  "-translate-x-1/2",
  "-translate-x-1/2",
  "-translate-x-1/2",
  "-translate-x-full",
];
// Stryker restore all

/**
 * The day track of one card: a slider coloured by the local day periods,
 * with a handle at the reference moment and, from 768 px, local hour labels.
 * It selects by pointer and touch and moves by keys; the page keeps scrolling
 * for a vertical swipe that starts on it.
 * Implements FR1, FR2, FR3, FR4, FR6, FR7, FR9, UX1, UX2, UX3, NFR-A2, NFR-A3,
 * NFR-R2 of add-time-sliders-to-location-cards (D7).
 */
export function DayTrack({
  track,
  city,
  onSelectFraction,
  onMoveTrack,
}: DayTrackProps) {
  const { t } = useTranslation();
  const touchGesture = useRef<TouchGesture | null>(null);

  const selectAt = (event: PointerEvent<HTMLDivElement>) => {
    const { left, width } = event.currentTarget.getBoundingClientRect();
    if (width <= 0) return;
    const fraction = (event.clientX - left) / width;
    onSelectFraction(
      Math.min(Math.max(fraction, MIN_TRACK_FRACTION), MAX_TRACK_FRACTION),
    );
  };

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType === TOUCH_POINTER_TYPE) {
      touchGesture.current = {
        pointerId: event.pointerId,
        start: { x: event.clientX, y: event.clientY },
        decision: TouchGestureDecision.WAIT,
      };
      return;
    }
    event.currentTarget.setPointerCapture(event.pointerId);
    selectAt(event);
  };

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const gesture = touchGesture.current;
    if (gesture === null || gesture.pointerId !== event.pointerId) {
      if (event.currentTarget.hasPointerCapture(event.pointerId)) {
        selectAt(event);
      }
      return;
    }
    if (gesture.decision === TouchGestureDecision.WAIT) {
      gesture.decision = getTouchGestureDecision(gesture.start, {
        x: event.clientX,
        y: event.clientY,
      });
      if (gesture.decision === TouchGestureDecision.SELECT) {
        event.currentTarget.setPointerCapture(event.pointerId);
      }
    }
    if (gesture.decision === TouchGestureDecision.SELECT) selectAt(event);
  };

  const handlePointerEnd = (event: PointerEvent<HTMLDivElement>) => {
    const gesture = touchGesture.current;
    touchGesture.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    if (gesture?.decision === TouchGestureDecision.WAIT) selectAt(event);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const move = getTrackMoveForKey(event.key);
    if (move === undefined) return;
    event.preventDefault();
    onMoveTrack(move);
  };

  return (
    <div
      data-day-track
      className="order-last flex basis-full flex-col md:order-none md:min-w-0 md:basis-0 md:flex-1"
    >
      <div
        role="slider"
        tabIndex={0}
        aria-label={t("locations.timeSliderLabel", { city })}
        aria-valuemin={TRACK_VALUE_MIN_MINUTES}
        aria-valuemax={track.maxMinutes}
        aria-valuenow={track.valueMinutes}
        aria-valuetext={track.valueText}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerEnd}
        onPointerCancel={() => {
          touchGesture.current = null;
        }}
        onKeyDown={handleKeyDown}
        className="group relative h-11 w-full cursor-pointer touch-pan-y select-none outline-none"
      >
        <div
          data-day-track-bar
          className="absolute inset-x-0 top-1/2 h-2.5 -translate-y-1/2 rounded-full md:h-3"
          style={{ backgroundImage: buildDayTrackGradient(track.stops) }}
        />
        <div
          data-day-track-handle
          className="pointer-events-none absolute top-1/2 flex h-11 w-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center"
          style={{ left: formatPercent(track.fraction) }}
        >
          <span className="h-7 w-7 rounded-full border-2 border-foreground bg-surface group-focus-visible:outline group-focus-visible:outline-2 group-focus-visible:outline-offset-2 group-focus-visible:outline-accent md:h-8 md:w-8" />
        </div>
      </div>
      <div
        aria-hidden="true"
        className="relative hidden h-4 text-xs tabular-nums text-muted-foreground md:block"
      >
        {track.hourLabels.map((hourLabel, labelIndex) => (
          <span
            key={hourLabel.fraction}
            data-hour-label
            // Stryker disable next-line StringLiteral: equivalent — every label index has a class
            className={`absolute top-0 ${LABEL_ALIGNMENT_CLASS_NAMES[labelIndex] ?? ""}`}
            style={{ left: formatPercent(hourLabel.fraction) }}
          >
            {hourLabel.label}
          </span>
        ))}
      </div>
    </div>
  );
}
