// Verifies FR17, FR18, FR19, NFR-A1, NFR-A2 of move-meeting-range-and-extend-past-midnight.
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { TrackMove } from "@/controller";
import { MeetingHandle } from "@/model";
import type { PresentedMeetingHandle } from "@/presenter";
import { MoveHandleSlider } from "./MoveHandle";

const MOVE_HANDLE: PresentedMeetingHandle<MeetingHandle.MOVE> = {
  handle: MeetingHandle.MOVE,
  label: "Move meeting",
  valueMinutes: 540,
  minMinutes: 0,
  maxMinutes: 1425,
  valueText: "09:00–11:00",
};

const renderHandle = (isMoving = false) => {
  const onMoveMeeting = vi.fn();
  const onDragMeetingTo = vi.fn();
  render(
    <ul>
      <li>
        <div data-hour-strip />
      </li>
      <MoveHandleSlider
        presented={MOVE_HANDLE}
        cellPitchPx={40}
        isScrollable={false}
        tailCellCount={0}
        isMoving={isMoving}
        onMoveMeeting={onMoveMeeting}
        onDragMeetingTo={onDragMeetingTo}
        onDragActiveChange={vi.fn()}
      />
    </ul>,
  );
  return { onMoveMeeting, onDragMeetingTo, slider: screen.getByRole("slider") };
};

describe("MoveHandleSlider", () => {
  it("should be a slider with the values of the start of the range", () => {
    const { slider } = renderHandle();

    expect(slider).toHaveAttribute("aria-label", "Move meeting");
    expect([
      slider.getAttribute("aria-valuenow"),
      slider.getAttribute("aria-valuemin"),
      slider.getAttribute("aria-valuemax"),
      slider.getAttribute("aria-valuetext"),
    ]).toEqual(["540", "0", "1425", "09:00–11:00"]);
  });

  it.each([
    ["ArrowRight", TrackMove.NEXT_STEP],
    ["ArrowUp", TrackMove.NEXT_STEP],
    ["ArrowLeft", TrackMove.PREVIOUS_STEP],
    ["ArrowDown", TrackMove.PREVIOUS_STEP],
    ["PageUp", TrackMove.HOUR_FORWARD],
    ["PageDown", TrackMove.HOUR_BACK],
    ["Home", TrackMove.DAY_START],
    ["End", TrackMove.DAY_END],
  ])("should move the meeting by %s", (key, move) => {
    const { slider, onMoveMeeting } = renderHandle();

    fireEvent.keyDown(slider, { key });

    expect(onMoveMeeting).toHaveBeenCalledWith(move);
  });

  it("should ignore other keys", () => {
    const { slider, onMoveMeeting } = renderHandle();

    fireEvent.keyDown(slider, { key: "a" });

    expect(onMoveMeeting).not.toHaveBeenCalled();
  });

  it("should be one Tab stop", () => {
    const { slider } = renderHandle();

    expect(slider).toHaveAttribute("tabindex", "0");
  });

  it("should stand on the move handle layer, above the start and end handles' layer", () => {
    renderHandle();

    expect(document.querySelector("[data-meeting-handle]")).toHaveClass(
      "z-move-handle",
      "fixed",
    );
  });

  it("should draw the grip 36 by 12 px in a hit area of 48 by 44 px", () => {
    const { slider } = renderHandle();

    expect(slider.parentElement).toHaveClass("h-11", "w-12");
    expect(slider.firstElementChild).toHaveClass("h-3", "w-9");
  });

  it("should mark the lifted look while the range is moved", () => {
    renderHandle(true);

    expect(document.querySelector("[data-meeting-handle]")).toHaveAttribute(
      "data-moving",
    );
  });

  it("should not mark the lifted look at rest", () => {
    renderHandle(false);

    expect(document.querySelector("[data-meeting-handle]")).not.toHaveAttribute(
      "data-moving",
    );
  });

  it("should drag the whole meeting by the pointer", () => {
    const { slider, onDragMeetingTo } = renderHandle();

    fireEvent.pointerDown(slider, { pointerType: "mouse", clientX: 100 });
    fireEvent.pointerMove(slider, { pointerType: "mouse", clientX: 140 });

    expect(onDragMeetingTo).toHaveBeenLastCalledWith(540 + 60);
  });
});
