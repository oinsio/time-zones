import { type RefObject, useLayoutEffect } from "react";
import {
  MEETING_BAR_SELECTOR,
  MEETING_FRAME_SELECTOR,
  MoveHandleCssVariable,
} from "@/constants";
import { getMoveHandleCentre } from "./moveHandlePlacement";

const PIXEL_UNIT = "px";

/**
 * Places the fixed move handle: measures the meeting frame and the meeting bar
 * on page scroll, strip scroll, resize and a change of the range (`rangeKey`),
 * at most once per animation frame, and writes the centre to CSS variables on
 * the handle, so a scroll re-renders nothing.
 * Implements FR17, NFR-P1, UX2 of move-meeting-range-and-extend-past-midnight (D8).
 */
export function useMoveHandlePlacement(
  handleElement: RefObject<HTMLElement | null>,
  rangeKey: string,
) {
  // biome-ignore lint/correctness/useExhaustiveDependencies: a new range key re-measures the frame
  useLayoutEffect(() => {
    const element = handleElement.current;
    const panel = element?.parentElement;
    if (!element || !panel) return;
    let pendingFrame: number | undefined;
    const measure = () => {
      pendingFrame = undefined;
      const frame = panel.querySelector(MEETING_FRAME_SELECTOR);
      if (frame === null) return;
      const centre = getMoveHandleCentre(
        frame.getBoundingClientRect(),
        document.querySelector(MEETING_BAR_SELECTOR)?.getBoundingClientRect(),
      );
      element.style.setProperty(
        MoveHandleCssVariable.CENTRE_X,
        `${centre.x}${PIXEL_UNIT}`,
      );
      element.style.setProperty(
        MoveHandleCssVariable.CENTRE_Y,
        `${centre.y}${PIXEL_UNIT}`,
      );
    };
    const scheduleMeasure = () => {
      if (pendingFrame === undefined) {
        pendingFrame = window.requestAnimationFrame(measure);
      }
    };
    measure();
    window.addEventListener("scroll", scheduleMeasure, { passive: true });
    window.addEventListener("resize", scheduleMeasure);
    panel.addEventListener("scroll", scheduleMeasure, { passive: true });
    return () => {
      if (pendingFrame !== undefined) window.cancelAnimationFrame(pendingFrame);
      window.removeEventListener("scroll", scheduleMeasure);
      window.removeEventListener("resize", scheduleMeasure);
      panel.removeEventListener("scroll", scheduleMeasure);
    };
  }, [handleElement, rangeKey]);
}
