// Verifies FR5, FR6 of add-grid-meeting-range-and-share (D6): the gesture bookkeeping of a drag.
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
