// Verifies FR5, FR6 of add-grid-meeting-range-and-share (D6): the gesture bookkeeping of a drag.
// Verifies FR15, FR16 of move-meeting-range-and-extend-past-midnight (D6): the guards of the cell selection.
import { fireEvent } from "@testing-library/react";
import i18n from "i18next";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cellOf, renderStrip, xInColumn } from "./hourStripFixture";

describe("HourStrip selection gesture", () => {
  beforeEach(() => i18n.changeLanguage("en"));
  afterEach(() => i18n.changeLanguage("ru"));

  it("should drag by mouse on a scrolling strip", () => {
    const { onSelectCells, slider } = renderStrip({ isScrollable: true });

    fireEvent.pointerDown(slider, {
      pointerType: "mouse",
      clientX: xInColumn(9),
    });
    fireEvent.pointerMove(slider, {
      pointerType: "mouse",
      clientX: xInColumn(10),
    });

    expect(onSelectCells).toHaveBeenLastCalledWith(9, 10);
  });

  it("should capture the pointer once per drag", () => {
    const { slider } = renderStrip();
    const setPointerCapture = vi.fn();
    slider.setPointerCapture = setPointerCapture;

    fireEvent.pointerDown(slider, {
      pointerType: "mouse",
      clientX: xInColumn(9),
    });
    fireEvent.pointerMove(slider, {
      pointerType: "mouse",
      clientX: xInColumn(10),
    });
    fireEvent.pointerMove(slider, {
      pointerType: "mouse",
      clientX: xInColumn(11),
    });

    expect(setPointerCapture).toHaveBeenCalledOnce();
  });

  it("should select by the click that follows the click ending a drag", () => {
    const { onSelectCells, slider } = renderStrip();
    fireEvent.pointerDown(slider, {
      pointerType: "mouse",
      clientX: xInColumn(9),
    });
    fireEvent.pointerMove(slider, {
      pointerType: "mouse",
      clientX: xInColumn(10),
    });
    fireEvent.click(cellOf(10));
    onSelectCells.mockClear();

    fireEvent.click(cellOf(4));

    expect(onSelectCells).toHaveBeenCalledWith(4, 4);
  });
});

describe("HourStrip selection beside the move of the frame", () => {
  // The frame spans columns 13 and 14 (13:00–15:00) of the stubbed strip.
  const FRAME = { startMinutes: 780, endMinutes: 900 };

  it.each(["mouse", "pen"])(
    "should start no cell drag from a %s press inside the frame",
    (pointerType) => {
      const { onSelectCells, slider } = renderStrip({ meetingFrame: FRAME });

      fireEvent.pointerDown(slider, { pointerType, clientX: xInColumn(13) });
      fireEvent.pointerMove(slider, { pointerType, clientX: xInColumn(14) });

      expect(onSelectCells).not.toHaveBeenCalled();
    },
  );

  it("should keep a click inside the frame a tap", () => {
    const { onSelectCells } = renderStrip({ meetingFrame: FRAME });

    fireEvent.click(cellOf(14));

    expect(onSelectCells).toHaveBeenCalledWith(14, 14);
  });

  it("should still set a range from a mouse press outside the frame", () => {
    const { onSelectCells, slider } = renderStrip({ meetingFrame: FRAME });

    fireEvent.pointerDown(slider, {
      pointerType: "mouse",
      clientX: xInColumn(9),
    });
    fireEvent.pointerMove(slider, {
      pointerType: "mouse",
      clientX: xInColumn(10),
    });

    expect(onSelectCells).toHaveBeenLastCalledWith(9, 10);
  });

  it("should let a finger inside the frame make a cell drag on fitting strips", () => {
    const { onSelectCells, slider } = renderStrip({ meetingFrame: FRAME });

    fireEvent.pointerDown(slider, {
      pointerType: "touch",
      clientX: xInColumn(13),
    });
    fireEvent.pointerMove(slider, {
      pointerType: "touch",
      clientX: xInColumn(14),
    });

    expect(onSelectCells).toHaveBeenLastCalledWith(13, 14);
  });

  it("should set nothing from the cells a held finger touches while the range moves", () => {
    const { onSelectCells, slider } = renderStrip({
      meetingFrame: FRAME,
      isFrameMoving: () => true,
    });

    fireEvent.pointerDown(slider, {
      pointerType: "touch",
      clientX: xInColumn(13),
    });
    fireEvent.pointerMove(slider, {
      pointerType: "touch",
      clientX: xInColumn(15),
    });

    expect(onSelectCells).not.toHaveBeenCalled();
  });
});
