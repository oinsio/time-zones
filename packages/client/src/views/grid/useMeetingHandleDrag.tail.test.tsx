// Verifies FR10 of move-meeting-range-and-extend-past-midnight (D5): the drag core re-bases when the strip tail changes.
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { MeetingHandleSlider } from "./MeetingHandle";
import { END_HANDLE, installPanelGeometry } from "./meetingHandleFixture";

const SHRUNK_PITCH_PX = 36;
const GROWN_VALUE_MINUTES = 1470;
const START_PITCH_PX = 40;

describe("useMeetingHandleDrag when the strip tail grows", () => {
  it("should not make the end jump when the pitch shrinks under the pointer", () => {
    installPanelGeometry();
    const onDragHandleTo = vi.fn();
    const renderPanel = (
      cellPitchPx: number,
      valueMinutes: number,
      tailCellCount: number,
    ) => (
      <ul>
        <li>
          <div data-hour-strip />
        </li>
        <MeetingHandleSlider
          presented={{ ...END_HANDLE, valueMinutes }}
          candidateRows={{ firstRow: 1, lastRow: 1 }}
          cellPitchPx={cellPitchPx}
          isScrollable={false}
          tailCellCount={tailCellCount}
          onMoveHandle={vi.fn()}
          onDragHandleTo={onDragHandleTo}
          onDragActiveChange={vi.fn()}
        />
      </ul>
    );
    const { rerender } = render(
      renderPanel(START_PITCH_PX, END_HANDLE.valueMinutes, 0),
    );
    const slider = screen.getByRole("slider");
    fireEvent.pointerDown(slider, { pointerType: "mouse", clientX: 500 });

    rerender(renderPanel(SHRUNK_PITCH_PX, GROWN_VALUE_MINUTES, 1));
    fireEvent.pointerMove(slider, { pointerType: "mouse", clientX: 500 });

    expect(onDragHandleTo).toHaveBeenLastCalledWith(
      END_HANDLE.handle,
      GROWN_VALUE_MINUTES,
    );
  });
});
