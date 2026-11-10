// Verifies FR9, FR10, FR12, NFR-A1, NFR-A2, NFR-R1 of add-grid-meeting-range-and-share (D6).
// Verifies FR7, NFR-A2, UX2 of refine-meeting-range-entry-and-handles.
import { fireEvent, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { TrackMove } from "@/controller";
import { MeetingHandle } from "@/model";
import {
  END_HANDLE,
  installPanelGeometry,
  ROW_HEIGHT_PX,
  renderHandle,
  START_HANDLE,
  STRIP_HEIGHT_PX,
} from "./meetingHandleFixture";

describe("MeetingHandleSlider", () => {
  afterEach(() => vi.restoreAllMocks());

  it("should be a slider named by the handle with the values of the range", () => {
    renderHandle();

    const slider = screen.getByRole("slider", { name: "Meeting end" });
    expect(slider).toHaveAttribute("aria-valuenow", "660");
    expect(slider).toHaveAttribute("aria-valuemin", "555");
    expect(slider).toHaveAttribute("aria-valuemax", "1440");
    expect(slider).toHaveAttribute("aria-valuetext", "11:00");
  });

  it("should be one Tab stop with an accent focus ring", () => {
    renderHandle();

    const slider = screen.getByRole("slider");
    expect(slider).toHaveAttribute("tabindex", "0");
    expect(slider).toHaveClass("focus-visible:outline-accent");
  });

  // NFR-A2, UX2 of refine-meeting-range-entry-and-handles: a 44 by 48 px hit area, the grip unchanged.
  it("should offer a hit area of at least 44 by 44 px around the same grip", () => {
    const { container } = renderHandle();

    expect(container.querySelector("[data-meeting-handle]")).toHaveClass(
      "w-11",
      "h-12",
    );
    expect(container.querySelector("[role=slider] > span")).toHaveClass(
      "h-9",
      "w-3",
    );
  });

  it("should lie above everything in the panel", () => {
    const { container } = renderHandle();

    expect(container.querySelector("[data-meeting-handle]")).toHaveClass(
      "z-meeting-handle",
    );
  });

  it("should stand on the minute of its end of the range", () => {
    const { container } = renderHandle({ presented: START_HANDLE });

    expect(
      (container.querySelector("[data-meeting-handle]") as HTMLElement).style
        .left,
    ).toBe("calc(var(--grid-row-padding) + 540 / 60 * var(--hour-cell-pitch))");
  });

  it.each([
    ["ArrowRight", TrackMove.NEXT_STEP],
    ["ArrowDown", TrackMove.PREVIOUS_STEP],
    ["PageUp", TrackMove.HOUR_FORWARD],
    ["PageDown", TrackMove.HOUR_BACK],
    ["Home", TrackMove.DAY_START],
    ["End", TrackMove.DAY_END],
  ])("should move by %s as %s and prevent the default", (key, move) => {
    const { onMoveHandle } = renderHandle();

    const isNotPrevented = fireEvent.keyDown(screen.getByRole("slider"), {
      key,
    });

    expect(onMoveHandle).toHaveBeenCalledWith(MeetingHandle.END, move);
    expect(isNotPrevented).toBe(false);
  });

  it("should ignore other keys", () => {
    const { onMoveHandle } = renderHandle();

    const isNotPrevented = fireEvent.keyDown(screen.getByRole("slider"), {
      key: "a",
    });

    expect(onMoveHandle).not.toHaveBeenCalled();
    expect(isNotPrevented).toBe(true);
  });

  it.each([
    [1, MeetingHandle.END, 1],
    [1, MeetingHandle.START, 1],
    [2, MeetingHandle.END, 1],
    [2, MeetingHandle.START, 2],
    [3, MeetingHandle.END, 2],
    [4, MeetingHandle.END, 2],
    [4, MeetingHandle.START, 3],
    [5, MeetingHandle.END, 3],
    [5, MeetingHandle.START, 4],
  ])(
    "should centre the handle of %i rows (%s) on row %i",
    (rowCount, handle, row) => {
      installPanelGeometry();
      const presented =
        handle === MeetingHandle.END ? END_HANDLE : START_HANDLE;

      const { container } = renderHandle({ presented, rowCount });

      expect(
        (container.querySelector("[data-meeting-handle]") as HTMLElement).style
          .top,
      ).toBe(`${(row - 1) * ROW_HEIGHT_PX + STRIP_HEIGHT_PX / 2}px`);
    },
  );
});

describe("MeetingHandleSlider among candidate rows", () => {
  afterEach(() => vi.restoreAllMocks());

  it.each([
    [MeetingHandle.END, 3],
    [MeetingHandle.START, 4],
  ])(
    "should stand the %s handle among candidate rows 2 to 4 on row %i",
    (handle, expectedRow) => {
      installPanelGeometry();
      const presented =
        handle === MeetingHandle.END ? END_HANDLE : START_HANDLE;

      const { container } = renderHandle({
        presented,
        rowCount: 6,
        candidateRows: { firstRow: 2, lastRow: 4 },
      });

      expect(
        (container.querySelector("[data-meeting-handle]") as HTMLElement).style
          .top,
      ).toBe(`${(expectedRow - 1) * ROW_HEIGHT_PX + STRIP_HEIGHT_PX / 2}px`);
    },
  );
});
