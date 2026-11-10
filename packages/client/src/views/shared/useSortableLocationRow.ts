import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { type CSSProperties, useRef } from "react";
import { getReorderTransition } from "./reorderTransition";
import { useDropSettleAnimation } from "./useDropSettleAnimation";

const DRAGGING_CLASS_NAME = " relative z-dragged-row shadow-lg";

/**
 * The drag reorder wiring of one location row: the sortable, the drop settle
 * animation and the `<li>` props that follow from them. While `isDisabled` no
 * sensor starts a reorder.
 * Implements FR1, FR2 of fix-grid-meeting-range-lock-and-layering (D1).
 */
export function useSortableLocationRow(
  id: string,
  prefersReducedMotion: boolean,
  isDisabled: boolean,
) {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
    isSorting,
  } = useSortable({
    id,
    transition: getReorderTransition(prefersReducedMotion),
    disabled: isDisabled,
  });
  const cardRef = useRef<HTMLLIElement | null>(null);
  const dropSettle = useDropSettleAnimation(
    cardRef,
    isDragging,
    isSorting,
    prefersReducedMotion,
  );
  const style: CSSProperties = {
    transform: dropSettle.transform ?? CSS.Transform.toString(transform),
    transition: dropSettle.transition ?? transition,
  };
  return {
    attributes,
    listeners,
    setActivatorNodeRef,
    setItemRef: (element: HTMLLIElement | null) => {
      cardRef.current = element;
      setNodeRef(element);
    },
    style,
    onTransitionEnd: dropSettle.onTransitionEnd,
    draggingClassName: isDragging ? DRAGGING_CLASS_NAME : "",
  };
}
