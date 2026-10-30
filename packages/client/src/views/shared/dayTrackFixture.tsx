// Verifies FR4 of fix-day-track-handle-overlap-and-end-of-day.
import { render } from "@testing-library/react";
import { vi } from "vitest";
import { DayPeriod, type PresentedDayTrack } from "@/presenter";
import { DayTrack } from "./DayTrack";

export const ALMATY_LABELS = ["00", "06", "12", "18", "00"];
export const ALMATY_TRACK: PresentedDayTrack = {
  fraction: 0.520833,
  valueMinutes: 750,
  maxMinutes: 1439,
  valueText: "12:30, Sun, Mar 8",
  stops: [
    { fraction: 0.270833, period: DayPeriod.NIGHT },
    { fraction: 0.3125, period: DayPeriod.MORNING },
    { fraction: 0.380208, period: DayPeriod.WORK },
  ],
  hourLabels: ALMATY_LABELS.map((label, labelIndex) => ({
    fraction: labelIndex / (ALMATY_LABELS.length - 1),
    label,
  })),
};

export const renderTrack = () =>
  render(
    <DayTrack
      track={ALMATY_TRACK}
      city="Almaty"
      onSelectFraction={vi.fn()}
      onMoveTrack={vi.fn()}
    />,
  );

export const TRACK_WIDTH = 400;
export const BAR_BOX = { left: 100, width: TRACK_WIDTH } as DOMRect;
export const WIDE_BOX = { left: 0, width: TRACK_WIDTH + 200 } as DOMRect;

/** Renders the Almaty track with a 400px wide slider and spy callbacks. */
export const setupInteractiveTrack = () => {
  const onSelectFraction = vi.fn();
  const onMoveTrack = vi.fn();
  const { getByRole } = render(
    <DayTrack
      track={ALMATY_TRACK}
      city="Almaty"
      onSelectFraction={onSelectFraction}
      onMoveTrack={onMoveTrack}
    />,
  );
  const slider = getByRole("slider");
  const bar = slider.querySelector<HTMLElement>(
    "[data-day-track-bar]",
  ) as HTMLElement;
  bar.getBoundingClientRect = () =>
    ({ left: 0, width: TRACK_WIDTH }) as DOMRect;
  slider.setPointerCapture = vi.fn();
  slider.releasePointerCapture = vi.fn();
  slider.hasPointerCapture = () => true;
  return { slider, bar, onSelectFraction, onMoveTrack };
};
