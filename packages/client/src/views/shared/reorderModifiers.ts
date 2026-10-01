import type { Modifier } from "@dnd-kit/core";

/**
 * Keeps a dragged card in its column.
 * Implements UX2 of reorder-locations-by-drag-and-drop (D5).
 */
export const restrictToVerticalAxis: Modifier = ({ transform }) => ({
  ...transform,
  x: 0,
});
