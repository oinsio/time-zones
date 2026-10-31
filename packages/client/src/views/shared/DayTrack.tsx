import type { KeyboardEvent } from "react";
import { useRef } from "react";
import { useTranslation } from "react-i18next";
import { TRACK_VALUE_MIN_MINUTES } from "@/constants";
import type { TrackMove } from "@/controller";
import { IS_POINTER_EVENTS_SUPPORTED } from "@/lib/legacy";
import type { PresentedDayTrack } from "@/presenter";
import { buildDayTrackGradient, formatPercent } from "./dayTrackGradient";
import { getTrackMoveForKey } from "./dayTrackKeys";
import { useDayTrackDrag } from "./useDayTrackDrag";
import { useDayTrackTouchFallback } from "./useDayTrackTouchFallback";

type DayTrackProps = {
  track: PresentedDayTrack;
  city: string;
  onSelectFraction: (fraction: number) => void;
  onMoveTrack: (move: TrackMove) => void;
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
 * NFR-R2 of add-time-sliders-to-location-cards (D7), FR8, NFR-A2, UX1 of
 * support-legacy-ios-12-safari (a click selects where Pointer Events are missing).
 * Implements FR1, FR4, UX1 of fix-day-track-handle-overlap-and-end-of-day (D2:
 * from 768 px the bar and handle sit inside the slider by half the handle).
 * Implements FR1, FR2, FR3, FR5, NFR-A1 of fix-day-track-drag-continuity-and-smoothness
 * (a drag follows the pointer wherever it goes; the handle follows it between steps).
 * Implements FR4, UX3 of fix-day-track-drag-continuity-and-smoothness (a finger drag
 * without Pointer Events).
 * Implements FR6 of fix-location-card-and-header-layout (D5): hour labels never wrap.
 */
export function DayTrack({
  track,
  city,
  onSelectFraction,
  onMoveTrack,
}: DayTrackProps) {
  const { t } = useTranslation();
  const sliderElement = useRef<HTMLDivElement>(null);
  const barElement = useRef<HTMLDivElement>(null);

  const {
    dragFraction,
    setDragFraction,
    selectAt,
    handlePointerDown,
    handlePointerMove,
    handlePointerEnd,
    handlePointerCancel,
  } = useDayTrackDrag(sliderElement, barElement, onSelectFraction);
  const isClickAfterTouchDrag = useDayTrackTouchFallback(
    sliderElement,
    barElement,
    onSelectFraction,
    setDragFraction,
  );

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
        ref={sliderElement}
        role="slider"
        tabIndex={0}
        aria-label={t("locations.timeSliderLabel", { city })}
        aria-valuemin={TRACK_VALUE_MIN_MINUTES}
        aria-valuemax={track.maxMinutes}
        aria-valuenow={track.valueMinutes}
        aria-valuetext={track.valueText}
        onClick={
          IS_POINTER_EVENTS_SUPPORTED
            ? undefined
            : (event) => {
                if (!isClickAfterTouchDrag()) selectAt(event);
              }
        }
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerEnd}
        onPointerCancel={handlePointerCancel}
        onKeyDown={handleKeyDown}
        className="group relative h-11 w-full cursor-pointer touch-pan-y select-none outline-none"
      >
        <div
          data-day-track-inset
          className="absolute inset-x-0 inset-y-0 md:inset-x-[22px]"
        >
          <div
            ref={barElement}
            data-day-track-bar
            className="absolute inset-x-0 top-1/2 h-2.5 -translate-y-1/2 rounded-full md:h-3"
            style={{ backgroundImage: buildDayTrackGradient(track.stops) }}
          />
          <div
            data-day-track-handle
            className="pointer-events-none absolute top-1/2 flex h-11 w-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center"
            style={{ left: formatPercent(dragFraction ?? track.fraction) }}
          >
            <span className="h-7 w-7 rounded-full border-2 border-foreground bg-surface group-focus-visible:outline group-focus-visible:outline-2 group-focus-visible:outline-offset-2 group-focus-visible:outline-accent md:h-8 md:w-8" />
          </div>
        </div>
      </div>
      <div
        aria-hidden="true"
        className="relative hidden h-4 text-xs tabular-nums text-muted-foreground md:mx-[22px] md:block"
      >
        {track.hourLabels.map((hourLabel, labelIndex) => (
          <span
            key={hourLabel.fraction}
            data-hour-label
            // Stryker disable next-line StringLiteral: equivalent — every label index has a class
            className={`absolute top-0 whitespace-nowrap ${LABEL_ALIGNMENT_CLASS_NAMES[labelIndex] ?? ""}`}
            style={{ left: formatPercent(hourLabel.fraction) }}
          >
            {hourLabel.label}
          </span>
        ))}
      </div>
    </div>
  );
}
