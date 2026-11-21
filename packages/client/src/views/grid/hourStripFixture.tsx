import { render, screen } from "@testing-library/react";
import { vi } from "vitest";
import { DayColour, type PresentedHourStrip } from "@/presenter";
import { ALMATY_TRACK } from "../shared/dayTrackFixture";
import { HourStrip } from "./HourStrip";

const cells = Array.from({ length: 24 }, (_, column) => ({
  key: `cell-${column}`,
  hourText: String(column),
  minuteText: column === 5 ? ":30" : "",
  dayPeriodMarker: column === 6 ? "AM" : "",
  dayColour: column < 9 ? DayColour.NIGHT : DayColour.DAY,
  hasOffsetEdge: column === 12,
  ...(column === 2
    ? { midnightMarker: { monthText: "MAR", dayText: "8" } }
    : {}),
}));
export const STRIP: PresentedHourStrip = { cells };

export const TAIL_CELL_COUNT = 3;
/** The strip of the past-midnight sample: 24 cells of the day and 3 of the tail. */
export const STRIP_WITH_TAIL: PresentedHourStrip = {
  cells: [
    ...cells,
    ...Array.from({ length: TAIL_CELL_COUNT }, (_, column) => ({
      ...cells[column],
      key: `tail-cell-${column}`,
    })),
  ],
};

export const PITCH_PX = 40;

type StripOverrides = {
  strip?: PresentedHourStrip;
  onMoveTrack?: () => void;
  isScrollable?: boolean;
  meetingColumns?: { first: number; last: number };
  hourFrameIndex?: number;
  tailCellCount?: number;
};

export function renderStrip(overrides: StripOverrides = {}) {
  const onMoveTrack = overrides.onMoveTrack ?? vi.fn();
  const onSelectCells = vi.fn();
  const onSelectFramedHour = vi.fn();
  const onSelectionActiveChange = vi.fn();
  render(
    <HourStrip
      city="Almaty"
      track={ALMATY_TRACK}
      strip={overrides.strip ?? STRIP}
      hourFrameIndex={
        "hourFrameIndex" in overrides ? overrides.hourFrameIndex : 12
      }
      cellPitchPx={PITCH_PX}
      isScrollable={overrides.isScrollable ?? false}
      meetingColumns={overrides.meetingColumns}
      tailCellCount={overrides.tailCellCount}
      onSelectionActiveChange={onSelectionActiveChange}
      onMoveTrack={onMoveTrack}
      onSelectCells={onSelectCells}
      onSelectFramedHour={onSelectFramedHour}
    />,
  );
  const slider = screen.getByRole("slider");
  slider.getBoundingClientRect = () => ({ left: 100 }) as DOMRect;
  return {
    onMoveTrack,
    onSelectCells,
    onSelectFramedHour,
    onSelectionActiveChange,
    slider,
  };
}

/** The x position inside the given column of the stubbed strip. */
export const xInColumn = (column: number) =>
  100 + column * PITCH_PX + PITCH_PX / 2;

export const cellOf = (column: number) =>
  document.querySelectorAll<HTMLElement>("[data-hour-cell]")[column];
