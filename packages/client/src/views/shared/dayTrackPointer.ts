import { MAX_TRACK_FRACTION, MIN_TRACK_FRACTION } from "@/constants";

type BarBox = Pick<DOMRect, "left" | "width">;

/**
 * The track fraction under a pointer, clamped to the track; null for a bar
 * without width.
 * Implements FR1 of fix-day-track-drag-continuity-and-smoothness (D2).
 */
export function getPointerTrackFraction(
  clientX: number,
  barBox: BarBox,
): number | null {
  if (barBox.width <= 0) return null;
  const fraction = (clientX - barBox.left) / barBox.width;
  return Math.min(Math.max(fraction, MIN_TRACK_FRACTION), MAX_TRACK_FRACTION);
}
