import { type PointerEvent, useRef } from "react";
import { TOUCH_POINTER_TYPE } from "@/constants";

type HourCellSelectionOptions = {
  cellCount: number;
  /** The cells that follow the reference day's cells: the strip tail, where no gesture starts. */
  tailCellCount: number;
  /** Called with `true` when a press on a cell of the day begins a gesture and with `false` when it ends. */
  onActiveChange: (isActive: boolean) => void;
  cellPitchPx: number;
  /** The strips scroll horizontally: a finger swipe scrolls and selects nothing. */
  isScrollable: boolean;
  onSelectCells: (firstColumn: number, lastColumn: number) => void;
};

/**
 * Pointer selection on an hour strip: a click on a cell selects its hour; a
 * mouse or pen drag, or a finger drag while all cells fit, selects the cells
 * from the first to the last touched. The pointer is captured only once the
 * drag starts, so a plain click still lands on its cell. A click that ends a
 * drag is ignored.
 * Implements FR5, FR6 of add-grid-meeting-range-and-share (D6).
 * Implements FR9 of move-meeting-range-and-extend-past-midnight (D10): a press or tap on a tail cell
 * changes nothing, and `onActiveChange` lets the grid freeze the tail while a gesture lasts.
 */
export function useHourCellSelection({
  cellCount,
  tailCellCount,
  onActiveChange,
  cellPitchPx,
  isScrollable,
  onSelectCells,
}: HourCellSelectionOptions) {
  const stripRef = useRef<HTMLDivElement | null>(null);
  const anchorColumn = useRef<number | undefined>(undefined);
  const lastColumn = useRef<number | undefined>(undefined);
  const hasDragged = useRef(false);

  const getColumnAt = (clientX: number) => {
    const stripLeftPx = stripRef.current?.getBoundingClientRect().left ?? 0;
    const column = Math.floor((clientX - stripLeftPx) / cellPitchPx);
    return Math.min(Math.max(column, 0), cellCount - 1);
  };
  const dayCellCount = cellCount - tailCellCount;
  const endGesture = () => {
    if (anchorColumn.current !== undefined) onActiveChange(false);
    anchorColumn.current = undefined;
  };

  return {
    stripRef,
    onPointerDown: (event: PointerEvent<HTMLElement>) => {
      hasDragged.current = false;
      const isScrollingFinger =
        event.pointerType === TOUCH_POINTER_TYPE && isScrollable;
      if (isScrollingFinger) return;
      const pressedColumn = getColumnAt(event.clientX);
      if (pressedColumn >= dayCellCount) return;
      anchorColumn.current = pressedColumn;
      lastColumn.current = pressedColumn;
      onActiveChange(true);
    },
    onPointerMove: (event: PointerEvent<HTMLElement>) => {
      const anchor = anchorColumn.current;
      if (anchor === undefined) return;
      const column = getColumnAt(event.clientX);
      if (column === lastColumn.current) return;
      if (!hasDragged.current) {
        hasDragged.current = true;
        event.currentTarget.setPointerCapture?.(event.pointerId);
      }
      lastColumn.current = column;
      onSelectCells(anchor, column);
    },
    onPointerUp: endGesture,
    onPointerCancel: endGesture,
    onCellClick: (column: number) => {
      if (column >= dayCellCount) return;
      if (hasDragged.current) {
        hasDragged.current = false;
        return;
      }
      onSelectCells(column, column);
    },
  };
}
