import type { DraggableAttributes } from "@dnd-kit/core";
import type { useSortable } from "@dnd-kit/sortable";
import { GripVertical } from "lucide-react";
import { forwardRef } from "react";
import { useTranslation } from "react-i18next";

type SortableListeners = ReturnType<typeof useSortable>["listeners"];

type DragHandleProps = {
  city: string;
  attributes: DraggableAttributes;
  listeners: SortableListeners;
};

/**
 * The only part of a card that starts a drag, so scrolling over the rest of
 * the card still scrolls the page.
 * Implements FR8, NFR-A5, UX3 of reorder-locations-by-drag-and-drop (D5).
 */
export const DragHandle = forwardRef<HTMLButtonElement, DragHandleProps>(
  function DragHandle({ city, attributes, listeners }, activatorRef) {
    const { t } = useTranslation();
    return (
      <button
        ref={activatorRef}
        type="button"
        {...attributes}
        {...listeners}
        aria-label={t("locations.moveLocation", { city })}
        aria-roledescription={t("locations.reorderRoleDescription")}
        className="flex min-h-11 min-w-11 touch-none cursor-grab items-center justify-center rounded-md text-muted-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
      >
        <GripVertical aria-hidden="true" />
      </button>
    );
  },
);
