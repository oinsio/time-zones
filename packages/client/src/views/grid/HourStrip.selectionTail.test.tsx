// Verifies FR9 of move-meeting-range-and-extend-past-midnight.
import { fireEvent } from "@testing-library/react";
import i18n from "i18next";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  cellOf,
  renderStrip,
  STRIP_WITH_TAIL,
  TAIL_CELL_COUNT,
  xInColumn,
} from "./hourStripFixture";

describe("HourStrip selection over the strip tail", () => {
  beforeEach(() => i18n.changeLanguage("en"));
  afterEach(() => i18n.changeLanguage("ru"));

  const renderTailStrip = () =>
    renderStrip({ strip: STRIP_WITH_TAIL, tailCellCount: TAIL_CELL_COUNT });

  it("should change nothing on a tap on a tail cell", () => {
    const { onSelectCells } = renderTailStrip();

    fireEvent.click(cellOf(25));

    expect(onSelectCells).not.toHaveBeenCalled();
  });

  it("should start no drag on a press on a tail cell", () => {
    const { onSelectCells, onSelectionActiveChange, slider } =
      renderTailStrip();

    fireEvent.pointerDown(slider, {
      pointerType: "mouse",
      clientX: xInColumn(25),
    });
    fireEvent.pointerMove(slider, {
      pointerType: "mouse",
      clientX: xInColumn(26),
    });

    expect(onSelectCells).not.toHaveBeenCalled();
    expect(onSelectionActiveChange).not.toHaveBeenCalled();
  });

  it("should run a drag from the reference day onto the tail", () => {
    const { onSelectCells, slider } = renderTailStrip();

    fireEvent.pointerDown(slider, {
      pointerType: "mouse",
      clientX: xInColumn(21),
    });
    fireEvent.pointerMove(slider, {
      pointerType: "mouse",
      clientX: xInColumn(26),
    });

    expect(onSelectCells).toHaveBeenLastCalledWith(21, 26);
  });

  it("should freeze the tail from the press until the release", () => {
    const { onSelectionActiveChange, slider } = renderTailStrip();

    fireEvent.pointerDown(slider, {
      pointerType: "mouse",
      clientX: xInColumn(21),
    });
    fireEvent.pointerUp(slider, { pointerType: "mouse" });

    expect(onSelectionActiveChange.mock.calls).toEqual([[true], [false]]);
  });

  it("should select a cell of the day by a tap while the strip has a tail", () => {
    const { onSelectCells } = renderTailStrip();

    fireEvent.click(cellOf(23));

    expect(onSelectCells).toHaveBeenCalledWith(23, 23);
  });
});
