// Verifies FR1, FR3, FR5, FR6, FR8, FR11, FR12, NFR-A1, NFR-A2 of add-grid-hour-cells-and-hour-frame.
import { fireEvent, render, screen } from "@testing-library/react";
import i18n from "i18next";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { TrackMove } from "@/controller";
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
const STRIP: PresentedHourStrip = { cells };

function renderStrip(overrides: { onMoveTrack?: () => void } = {}) {
  const onMoveTrack = overrides.onMoveTrack ?? vi.fn();
  render(
    <HourStrip
      city="Almaty"
      track={ALMATY_TRACK}
      strip={STRIP}
      hourFrameIndex={12}
      onMoveTrack={onMoveTrack}
    />,
  );
  return { onMoveTrack, slider: screen.getByRole("slider") };
}

const cellOf = (column: number) =>
  document.querySelectorAll<HTMLElement>("[data-hour-cell]")[column];

describe("HourStrip", () => {
  beforeEach(() => i18n.changeLanguage("en"));
  afterEach(() => i18n.changeLanguage("ru"));

  it("should be the slider Time in Almaty with the track values", () => {
    const { slider } = renderStrip();

    expect(slider).toHaveAccessibleName("Time in Almaty");
    expect(slider).toHaveAttribute("aria-valuenow", "750");
    expect(slider).toHaveAttribute("aria-valuemin", "0");
    expect(slider).toHaveAttribute("aria-valuemax", "1439");
    expect(slider).toHaveAttribute("aria-valuetext", "12:30, Sun, Mar 8");
  });

  it("should be one Tab stop", () => {
    const { slider } = renderStrip();

    expect(slider).toHaveAttribute("tabindex", "0");
    expect(slider.querySelector("[tabindex]")).toBeNull();
  });

  it("should draw 24 cells", () => {
    renderStrip();

    expect(document.querySelectorAll("[data-hour-cell]")).toHaveLength(24);
  });

  it.each([
    ["PageUp", TrackMove.HOUR_FORWARD],
    ["PageDown", TrackMove.HOUR_BACK],
    ["ArrowRight", TrackMove.NEXT_STEP],
    ["ArrowLeft", TrackMove.PREVIOUS_STEP],
    ["Home", TrackMove.DAY_START],
    ["End", TrackMove.DAY_END],
  ])("should move %s as %s and prevent the default", (key, move) => {
    const { slider, onMoveTrack } = renderStrip();

    const isNotPrevented = fireEvent.keyDown(slider, { key });

    expect(onMoveTrack).toHaveBeenCalledWith(move);
    expect(isNotPrevented).toBe(false);
  });

  it("should ignore other keys", () => {
    const { slider, onMoveTrack } = renderStrip();

    const isNotPrevented = fireEvent.keyDown(slider, { key: "a" });

    expect(onMoveTrack).not.toHaveBeenCalled();
    expect(isNotPrevented).toBe(true);
  });

  it("should do nothing on a pointer down or a click on a cell", () => {
    const { onMoveTrack } = renderStrip();

    fireEvent.pointerDown(cellOf(3));
    fireEvent.click(cellOf(3));

    expect(onMoveTrack).not.toHaveBeenCalled();
  });

  it("should bold the texts of the framed column only", () => {
    renderStrip();

    expect(cellOf(12).querySelector("span")).toHaveClass("font-bold");
    expect(cellOf(11).querySelector("span")).not.toHaveClass("font-bold");
  });

  it("should show the month over the day on a midnight cell, shaded", () => {
    renderStrip();

    expect(cellOf(2)).toHaveTextContent("MAR8");
    expect(cellOf(2).style.boxShadow).toContain("--color-midnight-shade");
    expect(cellOf(3).style.boxShadow).toBe("");
  });

  it("should combine the shade and the offset edge on one cell", () => {
    render(
      <HourStrip
        city="Almaty"
        track={ALMATY_TRACK}
        strip={{
          cells: [
            {
              ...cells[2],
              hasOffsetEdge: true,
            },
          ],
        }}
        hourFrameIndex={0}
        onMoveTrack={vi.fn()}
      />,
    );

    expect(cellOf(0).style.boxShadow).toBe(
      "inset 0 0 0 999px var(--color-midnight-shade), inset 3px 0 0 var(--color-foreground)",
    );
  });

  it("should draw the offset edge on the left of its cell", () => {
    renderStrip();

    expect(cellOf(12).style.boxShadow).toContain("inset 3px 0 0");
    expect(cellOf(12).style.boxShadow).toContain("--color-foreground");
  });

  it("should show the minutes and the marker under the hour", () => {
    renderStrip();

    expect(cellOf(5)).toHaveTextContent("5:30");
    expect(cellOf(6)).toHaveTextContent("6AM");
  });

  it("should colour a cell by its day period", () => {
    renderStrip();

    expect(cellOf(3).style.backgroundColor).toBe("var(--color-day-night)");
    expect(cellOf(10).style.backgroundColor).toBe("var(--color-day-working)");
    expect(cellOf(3)).toHaveClass("text-foreground");
    expect(cellOf(10)).toHaveClass("text-hour-cell-foreground");
  });
});
