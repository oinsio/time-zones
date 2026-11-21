import { MINUTES_PER_HOUR } from "@/constants";

/** The minutes from the start of the reference day between which the meeting frame stands. */
export type MeetingFrameMinutes = { startMinutes: number; endMinutes: number };

/**
 * Whether a press at `clientX` on a strip lies inside the meeting frame: the
 * pointer's minutes along the strip, from its left edge, are between the
 * start and the end of the range.
 * Implements FR15, FR16 of move-meeting-range-and-extend-past-midnight (D6).
 */
export function isInsideMeetingFrame(
  frame: MeetingFrameMinutes | undefined,
  stripLeftPx: number,
  cellPitchPx: number,
  clientX: number,
): boolean {
  if (frame === undefined || cellPitchPx <= 0) return false;
  const pointerMinutes =
    ((clientX - stripLeftPx) / cellPitchPx) * MINUTES_PER_HOUR;
  return (
    pointerMinutes >= frame.startMinutes && pointerMinutes < frame.endMinutes
  );
}
