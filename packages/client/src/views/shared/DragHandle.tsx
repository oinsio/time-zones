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
  /** Locks the button while a meeting range is set; `false` when omitted. */
  isDisabled?: boolean;
};

/**
 * The only part of a card that starts a drag, so scrolling over the rest of
 * the card still scrolls the page.
 * Implements FR8, NFR-A5, UX3 of reorder-locations-by-drag-and-drop (D5).
 * Implements FR1, UX1 of fix-grid-meeting-range-lock-and-layering (D1): `isDisabled`.
 */
export const DragHandle = forwardRef<HTMLButtonElement, DragHandleProps>(
  function DragHandle(
    { city, attributes, listeners, isDisabled = false },
    activatorRef,
  ) {
    const { t } = useTranslation();
    return (
      <button
        ref={activatorRef}
        type="button"
        {...attributes}
        {...listeners}
        disabled={isDisabled}
        aria-label={t("locations.moveLocation", { city })}
        aria-roledescription={t("locations.reorderRoleDescription")}
        className="flex min-h-11 min-w-11 touch-none items-center justify-center rounded-md text-muted-foreground enabled:cursor-grab disabled:cursor-default disabled:opacity-40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
      >
        <GripVertical aria-hidden="true" />
      </button>
    );
  },
);
