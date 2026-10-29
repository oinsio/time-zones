import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useEffect, useMemo, useRef } from "react";
import {
  MIN_LOCATIONS_TO_REORDER,
  REORDER_POINTER_ACTIVATION_DISTANCE_PX,
  REORDER_TOUCH_ACTIVATION_DELAY_MS,
  REORDER_TOUCH_ACTIVATION_TOLERANCE_PX,
} from "@/constants";
import type { TrackMove } from "@/controller";
import { usePrefersReducedMotion } from "@/controller";
import { IS_POINTER_EVENTS_SUPPORTED } from "@/lib/legacy";
import type { LocationRow as LocationRowModel } from "@/presenter";
import { LocationRow } from "./LocationRow";
import { restrictToVerticalAxis } from "./reorderModifiers";
import { getMoveTargetIndex } from "./reorderTarget";
import { useReorderAnnouncements } from "./useReorderAnnouncements";

// Engines without Pointer Events (iOS Safari before 13) drag by finger through touch events.
const FINGER_OR_POINTER_SENSOR = IS_POINTER_EVENTS_SUPPORTED
  ? PointerSensor
  : TouchSensor;
const FINGER_OR_POINTER_OPTIONS = {
  activationConstraint: IS_POINTER_EVENTS_SUPPORTED
    ? { distance: REORDER_POINTER_ACTIVATION_DISTANCE_PX }
    : {
        delay: REORDER_TOUCH_ACTIVATION_DELAY_MS,
        tolerance: REORDER_TOUCH_ACTIVATION_TOLERANCE_PX,
      },
};

type LocationListProps = {
  rows: readonly LocationRowModel[];
  onRemove: (id: string) => void;
  /** `null` clears home. */
  onSetHome: (id: string | null) => void;
  onMove: (id: string, targetIndex: number) => void;
  onSelectTrackFraction: (fraction: number) => void;
  onMoveTrack: (move: TrackMove) => void;
};

/**
 * The locations in list order, sortable by drag and drop. After a removal,
 * focus moves to the next row's location menu button, or the previous one when the
 * last row was removed.
 * Implements FR10, NFR-A3 of add-locations-via-search (D10).
 * Implements FR1, FR3, FR7, UX2, UX3 of reorder-locations-by-drag-and-drop
 * (D5): a drop outside the list or on the card itself moves nothing.
 * Implements FR3, FR4 of add-time-sliders-to-location-cards (D8): passes the
 * track selection and move handlers to each row.
 * Implements FR9, UX2 of support-legacy-ios-12-safari (D8): TouchSensor where
 * Pointer Events are missing.
 * Implements FR11 of set-home-location-and-show-differences (D7, D8): the
 * focus after a removal goes to a location menu button.
 */
export function LocationList({
  rows,
  onRemove,
  onSetHome,
  onMove,
  onSelectTrackFraction,
  onMoveTrack,
}: LocationListProps) {
  const menuButtons = useRef<(HTMLButtonElement | null)[]>([]);
  const focusIndexAfterRemoval = useRef<number | null>(null);
  const prefersReducedMotion = usePrefersReducedMotion();
  const accessibility = useReorderAnnouncements(rows);
  // A stable array: a new one on every render makes dnd-kit drop the slide transition.
  const rowIds = useMemo(() => rows.map((row) => row.id), [rows]);
  const sensors = useSensors(
    useSensor(FINGER_OR_POINTER_SENSOR, FINGER_OR_POINTER_OPTIONS),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  useEffect(() => {
    const focusIndex = focusIndexAfterRemoval.current;
    focusIndexAfterRemoval.current = null;
    if (focusIndex === null) return;
    menuButtons.current[Math.min(focusIndex, rows.length - 1)]?.focus();
  }, [rows]);

  const handleRemove = (rowIndex: number, id: string) => {
    focusIndexAfterRemoval.current = rowIndex;
    onRemove(id);
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
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
      <SortableContext items={rowIds} strategy={verticalListSortingStrategy}>
        <ul className="flex flex-col gap-2">
          {rows.map((row, rowIndex) => (
            <LocationRow
              key={row.id}
              ref={(button) => {
                menuButtons.current[rowIndex] = button;
              }}
              row={row}
              onSelectTrackFraction={onSelectTrackFraction}
              onMoveTrack={onMoveTrack}
              onRemove={(id) => handleRemove(rowIndex, id)}
              onSetHome={onSetHome}
              isReorderable={rows.length >= MIN_LOCATIONS_TO_REORDER}
              prefersReducedMotion={prefersReducedMotion}
            />
          ))}
        </ul>
      </SortableContext>
    </DndContext>
  );
}
