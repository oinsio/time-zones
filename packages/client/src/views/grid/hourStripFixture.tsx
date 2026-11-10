import { render, screen } from "@testing-library/react";
import { vi } from "vitest";
import { DayPeriod, type PresentedHourStrip } from "@/presenter";
import { ALMATY_TRACK } from "../shared/dayTrackFixture";
import { HourStrip } from "./HourStrip";

const cells = Array.from({ length: 24 }, (_, column) => ({
  key: `cell-${column}`,
  hourText: String(column),
  minuteText: column === 5 ? ":30" : "",
  dayPeriodMarker: column === 6 ? "AM" : "",
  dayPeriod: column < 9 ? DayPeriod.NIGHT : DayPeriod.WORK,
  hasOffsetEdge: column === 12,
  ...(column === 2
    ? { midnightMarker: { monthText: "MAR", dayText: "8" } }
    : {}),
}));
export const STRIP: PresentedHourStrip = { cells };

export const PITCH_PX = 40;

type StripOverrides = {
  onMoveTrack?: () => void;
  isScrollable?: boolean;
  meetingColumns?: { first: number; last: number };
  hourFrameIndex?: number;
};

export function renderStrip(overrides: StripOverrides = {}) {
  const onMoveTrack = overrides.onMoveTrack ?? vi.fn();
  const onSelectCells = vi.fn();
  const onSelectFramedHour = vi.fn();
  render(
    <HourStrip
      city="Almaty"
      track={ALMATY_TRACK}
      strip={STRIP}
      hourFrameIndex={
        "hourFrameIndex" in overrides ? overrides.hourFrameIndex : 12
      }
      cellPitchPx={PITCH_PX}
      isScrollable={overrides.isScrollable ?? false}
      meetingColumns={overrides.meetingColumns}
      onMoveTrack={onMoveTrack}
      onSelectCells={onSelectCells}
      onSelectFramedHour={onSelectFramedHour}
    />,
  );
  const slider = screen.getByRole("slider");
  slider.getBoundingClientRect = () => ({ left: 100 }) as DOMRect;
  return { onMoveTrack, onSelectCells, onSelectFramedHour, slider };
}

/** The x position inside the given column of the stubbed strip. */
export const xInColumn = (column: number) =>
  100 + column * PITCH_PX + PITCH_PX / 2;

export const cellOf = (column: number) =>
  document.querySelectorAll<HTMLElement>("[data-hour-cell]")[column];
