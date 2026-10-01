import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useEffect, useRef } from "react";
import {
  MIN_LOCATIONS_TO_REORDER,
  REORDER_POINTER_ACTIVATION_DISTANCE_PX,
} from "@/constants";
import { usePrefersReducedMotion } from "@/controller";
import type { LocationRow as LocationRowModel } from "@/presenter";
import { LocationRow } from "./LocationRow";
import { restrictToVerticalAxis } from "./reorderModifiers";
import { getMoveTargetIndex } from "./reorderTarget";
import { useReorderAnnouncements } from "./useReorderAnnouncements";

type LocationListProps = {
  rows: readonly LocationRowModel[];
  onRemove: (id: string) => void;
  onMove: (id: string, targetIndex: number) => void;
};

/**
 * The locations in list order, sortable by drag and drop. After a removal,
 * focus moves to the next row's remove action, or the previous one when the
 * last row was removed.
 * Implements FR10, NFR-A3 of add-locations-via-search (D10).
 * Implements FR1, FR3, FR7, UX2, UX3 of reorder-locations-by-drag-and-drop
 * (D5): a drop outside the list or on the card itself moves nothing.
 */
export function LocationList({ rows, onRemove, onMove }: LocationListProps) {
  const removeButtons = useRef<(HTMLButtonElement | null)[]>([]);
  const focusIndexAfterRemoval = useRef<number | null>(null);
  const prefersReducedMotion = usePrefersReducedMotion();
  const accessibility = useReorderAnnouncements(rows);
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: REORDER_POINTER_ACTIVATION_DISTANCE_PX,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

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
    <DndContext
      sensors={sensors}
      modifiers={[restrictToVerticalAxis]}
      accessibility={accessibility}
      onDragEnd={({ active, over }) => {
        const targetIndex = getMoveTargetIndex(
          rows,
          String(active.id),
          over === null ? undefined : String(over.id),
        );
        if (targetIndex !== undefined) onMove(String(active.id), targetIndex);
      }}
    >
      <SortableContext
        items={rows.map((row) => row.id)}
        strategy={verticalListSortingStrategy}
      >
        <ul className="flex flex-col gap-2">
          {rows.map((row, rowIndex) => (
            <LocationRow
              key={row.id}
              ref={(button) => {
                removeButtons.current[rowIndex] = button;
              }}
              row={row}
              onRemove={(id) => handleRemove(rowIndex, id)}
              isReorderable={rows.length >= MIN_LOCATIONS_TO_REORDER}
              prefersReducedMotion={prefersReducedMotion}
            />
          ))}
        </ul>
      </SortableContext>
    </DndContext>
  );
}
