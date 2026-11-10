// Verifies FR5, FR6, FR7, NFR-A2 of add-grid-meeting-range-and-share (D6).
import { fireEvent } from "@testing-library/react";
import i18n from "i18next";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { cellOf, renderStrip, xInColumn } from "./hourStripFixture";

describe("HourStrip selection", () => {
  beforeEach(() => i18n.changeLanguage("en"));
  afterEach(() => i18n.changeLanguage("ru"));

  it("should select the cell's hour on a click", () => {
    const { onSelectCells } = renderStrip();

    fireEvent.click(cellOf(3));

    expect(onSelectCells).toHaveBeenCalledWith(3, 3);
  });

  it("should select from the first to the last cell of a mouse drag", () => {
    const { onSelectCells, slider } = renderStrip();

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

  it("should select backwards when the drag goes left", () => {
    const { onSelectCells, slider } = renderStrip();

    fireEvent.pointerDown(slider, {
      pointerType: "mouse",
      clientX: xInColumn(10),
    });
    fireEvent.pointerMove(slider, {
      pointerType: "mouse",
      clientX: xInColumn(8),
    });

    expect(onSelectCells).toHaveBeenLastCalledWith(10, 8);
  });

  it("should not select again while the pointer stays in one cell", () => {
    const { onSelectCells, slider } = renderStrip();

    fireEvent.pointerDown(slider, {
      pointerType: "pen",
      clientX: xInColumn(9),
    });
    fireEvent.pointerMove(slider, {
      pointerType: "pen",
      clientX: xInColumn(9) + 1,
    });

    expect(onSelectCells).not.toHaveBeenCalled();
  });

  it("should select nothing after the pointer is released", () => {
    const { onSelectCells, slider } = renderStrip();

    fireEvent.pointerDown(slider, {
      pointerType: "mouse",
      clientX: xInColumn(9),
    });
    fireEvent.pointerUp(slider, {
      pointerType: "mouse",
      clientX: xInColumn(9),
    });
    fireEvent.pointerMove(slider, {
      pointerType: "mouse",
      clientX: xInColumn(11),
    });

    expect(onSelectCells).not.toHaveBeenCalled();
  });

  it("should select nothing after the gesture is cancelled", () => {
    const { onSelectCells, slider } = renderStrip();

    fireEvent.pointerDown(slider, {
      pointerType: "touch",
      clientX: xInColumn(9),
    });
    fireEvent.pointerCancel(slider, { pointerType: "touch" });
    fireEvent.pointerMove(slider, {
      pointerType: "touch",
      clientX: xInColumn(11),
    });

    expect(onSelectCells).not.toHaveBeenCalled();
  });

  it("should drag by finger while all cells fit", () => {
    const { onSelectCells, slider } = renderStrip({ isScrollable: false });

    fireEvent.pointerDown(slider, {
      pointerType: "touch",
      clientX: xInColumn(9),
    });
    fireEvent.pointerMove(slider, {
      pointerType: "touch",
      clientX: xInColumn(10),
    });

    expect(onSelectCells).toHaveBeenLastCalledWith(9, 10);
  });

  it("should leave a finger swipe on a scrolling strip to the browser", () => {
    const { onSelectCells, slider } = renderStrip({ isScrollable: true });

    fireEvent.pointerDown(slider, {
      pointerType: "touch",
      clientX: xInColumn(9),
    });
    fireEvent.pointerMove(slider, {
      pointerType: "touch",
      clientX: xInColumn(10),
    });

    expect(onSelectCells).not.toHaveBeenCalled();
  });

  it("should ignore the click that ends a drag", () => {
    const { onSelectCells, slider } = renderStrip();
    fireEvent.pointerDown(slider, {
      pointerType: "mouse",
      clientX: xInColumn(9),
    });
    fireEvent.pointerMove(slider, {
      pointerType: "mouse",
      clientX: xInColumn(10),
    });
    onSelectCells.mockClear();

    fireEvent.click(cellOf(10));

    expect(onSelectCells).not.toHaveBeenCalled();
  });

  it("should select again by click after an earlier drag", () => {
    const { onSelectCells, slider } = renderStrip();
    fireEvent.pointerDown(slider, {
      pointerType: "mouse",
      clientX: xInColumn(9),
    });
    fireEvent.pointerMove(slider, {
      pointerType: "mouse",
      clientX: xInColumn(10),
    });
    fireEvent.pointerDown(cellOf(4), {
      pointerType: "mouse",
      clientX: xInColumn(4),
    });
    onSelectCells.mockClear();

    fireEvent.click(cellOf(4));

    expect(onSelectCells).toHaveBeenCalledWith(4, 4);
  });

  it("should clamp a drag outside the strip to its first and last cell", () => {
    const { onSelectCells, slider } = renderStrip();

    fireEvent.pointerDown(slider, {
      pointerType: "mouse",
      clientX: xInColumn(1),
    });
    fireEvent.pointerMove(slider, { pointerType: "mouse", clientX: 5000 });
    expect(onSelectCells).toHaveBeenLastCalledWith(1, 23);

    fireEvent.pointerMove(slider, { pointerType: "mouse", clientX: -5000 });
    expect(onSelectCells).toHaveBeenLastCalledWith(1, 0);
  });

  it.each(["Enter", " "])(
    "should select the framed hour on %j and prevent the default",
    (key) => {
      const { slider, onSelectFramedHour } = renderStrip();

      const isNotPrevented = fireEvent.keyDown(slider, { key });

      expect(onSelectFramedHour).toHaveBeenCalledOnce();
      expect(isNotPrevented).toBe(false);
    },
  );

  it("should let the browser pan vertically only while all cells fit", () => {
    expect(renderStrip({ isScrollable: false }).slider).toHaveClass(
      "touch-pan-y",
    );
  });

  it("should let the browser pan both ways on a scrolling strip", () => {
    expect(renderStrip({ isScrollable: true }).slider).toHaveClass(
      "touch-pan-x",
      "touch-pan-y",
    );
  });

  it("should describe the strip by the Enter hint", () => {
    const { slider } = renderStrip();

    expect(slider).toHaveAccessibleDescription(
      "Enter — select a meeting at this hour",
    );
  });

  it("should dim the cells outside the meeting columns only", () => {
    renderStrip({
      meetingColumns: { first: 9, last: 10 },
      hourFrameIndex: undefined,
    });

    expect(cellOf(8)).toHaveClass("opacity-40");
    expect(cellOf(11)).toHaveClass("opacity-40");
    expect(cellOf(9)).not.toHaveClass("opacity-40");
    expect(cellOf(10)).not.toHaveClass("opacity-40");
  });

  it("should bold no cell without an hour frame", () => {
    renderStrip({ hourFrameIndex: undefined });

    expect(cellOf(12).querySelector(".font-bold")).toBeNull();
  });
});
