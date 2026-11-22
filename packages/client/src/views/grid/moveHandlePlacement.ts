import { MEETING_BAR_LINE_PX, MEETING_FRAME_BORDER_PX } from "@/constants";

const HALF = 2;

export type MoveHandleCentre = { x: number; y: number };

/**
 * The centre of the move handle in the viewport: the horizontal centre of the
 * meeting frame, and the axis of the frame's top line, but never above the
 * axis of the bottom line of the meeting bar.
 * Implements FR17, UX2 of move-meeting-range-and-extend-past-midnight (D8).
 */
export function getMoveHandleCentre(
  frameRect: Pick<DOMRect, "left" | "width" | "top">,
  meetingBarRect: Pick<DOMRect, "bottom"> | undefined,
): MoveHandleCentre {
  const frameAxisY = frameRect.top + MEETING_FRAME_BORDER_PX / HALF;
  const barAxisY =
    meetingBarRect === undefined
      ? Number.NEGATIVE_INFINITY
      : meetingBarRect.bottom - MEETING_BAR_LINE_PX / HALF;
  return {
    x: frameRect.left + frameRect.width / HALF,
    y: Math.max(frameAxisY, barAxisY),
  };
}
