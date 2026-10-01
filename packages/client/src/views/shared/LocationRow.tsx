import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { X } from "lucide-react";
import { forwardRef } from "react";
import { useTranslation } from "react-i18next";
import type { LocationRow as LocationRowModel } from "@/presenter";
import { DragHandle } from "./DragHandle";
import { getReorderTransition } from "./reorderTransition";

type LocationRowProps = {
  row: LocationRowModel;
  onRemove: (id: string) => void;
  isReorderable: boolean;
  prefersReducedMotion: boolean;
};

/**
 * One location: move handle, city, country, UTC offset and its remove action.
 * Implements FR10, UX4 of add-locations-via-search (D10).
 * Implements FR1, FR6, UX1 of show-utc-offset-on-location-rows (D5).
 * Implements FR1, UX1, UX2 of reorder-locations-by-drag-and-drop (D5): the
 * card itself is translated while dragged, so it keeps its width and slot.
 */
export const LocationRow = forwardRef<HTMLButtonElement, LocationRowProps>(
  function LocationRow(
    { row, onRemove, isReorderable, prefersReducedMotion },
    removeButtonRef,
  ) {
    const { t } = useTranslation();
    const {
      attributes,
      listeners,
      setNodeRef,
      setActivatorNodeRef,
      transform,
      transition,
      isDragging,
    } = useSortable({
      id: row.id,
      transition: getReorderTransition(prefersReducedMotion),
    });
    const hasSecondaryLine =
      row.countryName !== "" || row.utcOffsetLabel !== "";
    const draggingClassName = isDragging ? " relative z-10 shadow-lg" : "";
    return (
      <li
        ref={setNodeRef}
        style={{ transform: CSS.Transform.toString(transform), transition }}
        className={`flex items-center gap-3 rounded-md border border-border bg-surface px-4 py-3${draggingClassName}`}
      >
        {isReorderable && (
          <DragHandle
            ref={setActivatorNodeRef}
            city={row.cityLabel}
            attributes={attributes}
            listeners={listeners}
          />
        )}
        <span className="flex flex-1 flex-col">
          <span className="font-semibold">{row.cityLabel}</span>
          {hasSecondaryLine && (
            <span className="flex flex-wrap gap-x-2 text-sm text-muted-foreground">
              {row.countryName !== "" && <span>{row.countryName}</span>}
              {row.utcOffsetLabel !== "" && <span>{row.utcOffsetLabel}</span>}
            </span>
          )}
        </span>
        <button
          ref={removeButtonRef}
          type="button"
          aria-label={t("locations.removeLocation", { city: row.cityLabel })}
          onClick={() => onRemove(row.id)}
          className="flex min-h-11 min-w-11 items-center justify-center rounded-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
        >
          <X aria-hidden="true" />
        </button>
      </li>
    );
  },
);
