import { useEffect, useRef } from "react";
import type { LocationRow as LocationRowModel } from "@/presenter";
import { LocationRow } from "./LocationRow";

type LocationListProps = {
  rows: readonly LocationRowModel[];
  onRemove: (id: string) => void;
};

/**
 * The locations in list order. After a removal, focus moves to the next row's
 * remove action, or the previous one when the last row was removed.
 * Implements FR10, NFR-A3 of add-locations-via-search (D10).
 */
export function LocationList({ rows, onRemove }: LocationListProps) {
  const removeButtons = useRef<(HTMLButtonElement | null)[]>([]);
  const focusIndexAfterRemoval = useRef<number | null>(null);

  useEffect(() => {
    const focusIndex = focusIndexAfterRemoval.current;
    focusIndexAfterRemoval.current = null;
    if (focusIndex === null) return;
    removeButtons.current[Math.min(focusIndex, rows.length - 1)]?.focus();
  }, [rows]);

  const handleRemove = (rowIndex: number, id: string) => {
    focusIndexAfterRemoval.current = rowIndex;
    onRemove(id);
  };

  return (
    <ul className="flex flex-col gap-2">
      {rows.map((row, rowIndex) => (
        <LocationRow
          key={row.id}
          ref={(button) => {
            removeButtons.current[rowIndex] = button;
          }}
          row={row}
          onRemove={(id) => handleRemove(rowIndex, id)}
        />
      ))}
    </ul>
  );
}
