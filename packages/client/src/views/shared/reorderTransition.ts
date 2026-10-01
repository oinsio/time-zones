import {
  REORDER_TRANSITION_DURATION_MS,
  REORDER_TRANSITION_EASING,
} from "@/constants";

type ReorderTransition = { duration: number; easing: string };

/**
 * The slide of cards making room for a dragged card; none when the user asks
 * to reduce motion.
 * Implements UX1, NFR-A4 of reorder-locations-by-drag-and-drop (D5).
 */
export function getReorderTransition(
  prefersReducedMotion: boolean,
): ReorderTransition | null {
  return prefersReducedMotion
    ? null
    : {
        duration: REORDER_TRANSITION_DURATION_MS,
        easing: REORDER_TRANSITION_EASING,
      };
}
