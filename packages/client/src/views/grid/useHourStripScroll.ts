import {
  type CSSProperties,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  GRID_ROW_PADDING_PX,
  HOUR_CELL_GAP_PX,
  HourGridCssVariable,
} from "@/constants";
import { usePrefersReducedMotion } from "@/controller";
import { getHourCellLayout } from "./hourCellLayout";

const HALF = 2;
const PIXEL_UNIT = "px";

/**
 * The hour grid's layout, measured in the view: the panel's width gives the
 * cell width (CSS variables on the panel), and the panel scrolls so that the
 * hour frame is fully visible on opening and whenever it moves out of view.
 * Width and scroll are view state, never stored.
 * Implements NFR-R1, NFR-R2, UX3 of add-grid-hour-cells-and-hour-frame (D5).
 * Implements FR10, FR11 of add-grid-meeting-range-and-share (D6): while a meeting range
 * is set the panel does not follow the hour frame; the user and the handle drag scroll it.
 */
export function useHourStripScroll(
  hourFrameIndex: number,
  cellCount: number,
  isFollowingHourFrame = true,
) {
  const [panelElement, setPanelElement] = useState<HTMLUListElement | null>(
    null,
  );
  const [panelWidthPx, setPanelWidthPx] = useState(0);
  const prefersReducedMotion = usePrefersReducedMotion();
  const hasScrolledOnce = useRef(false);

  useLayoutEffect(() => {
    const panel = panelElement;
    if (panel === null) return;
    setPanelWidthPx(panel.clientWidth);
    const observer = new ResizeObserver(() =>
      setPanelWidthPx(panel.clientWidth),
    );
    observer.observe(panel);
    return () => observer.disconnect();
  }, [panelElement]);

  const layout = useMemo(
    () =>
      getHourCellLayout(panelWidthPx - HALF * GRID_ROW_PADDING_PX, cellCount),
    [panelWidthPx, cellCount],
  );

  useEffect(() => {
    const panel = panelElement;
    if (panel === null || !layout.isScrollable || !isFollowingHourFrame) return;
    const frameStartPx =
      GRID_ROW_PADDING_PX + hourFrameIndex * layout.cellPitchPx;
    const frameEndPx = frameStartPx + layout.cellPitchPx;
    const isVisible =
      frameStartPx >= panel.scrollLeft &&
      frameEndPx <= panel.scrollLeft + panel.clientWidth;
    if (isVisible) {
      hasScrolledOnce.current = true;
      return;
    }
    const maxScrollLeft = panel.scrollWidth - panel.clientWidth;
    const targetPx = Math.min(
      Math.max(
        frameStartPx + layout.cellPitchPx / HALF - panel.clientWidth / HALF,
        0,
      ),
      maxScrollLeft,
    );
    if (
      hasScrolledOnce.current &&
      !prefersReducedMotion &&
      typeof panel.scrollTo === "function"
    ) {
      panel.scrollTo({ left: targetPx, behavior: "smooth" });
    } else {
      panel.scrollLeft = targetPx;
    }
    hasScrolledOnce.current = true;
  }, [
    panelElement,
    hourFrameIndex,
    layout,
    prefersReducedMotion,
    isFollowingHourFrame,
  ]);

  const panelStyle = useMemo(
    () =>
      ({
        [HourGridCssVariable.PANEL_WIDTH]: `${panelWidthPx}${PIXEL_UNIT}`,
        [HourGridCssVariable.ROW_PADDING]: `${GRID_ROW_PADDING_PX}${PIXEL_UNIT}`,
        [HourGridCssVariable.CELL_PITCH]: `${layout.cellPitchPx}${PIXEL_UNIT}`,
        [HourGridCssVariable.CELL_COUNT]: cellCount,
        [HourGridCssVariable.CELL_GAP]: `${HOUR_CELL_GAP_PX}${PIXEL_UNIT}`,
      }) as CSSProperties,
    [panelWidthPx, layout, cellCount],
  );

  return { panelRef: setPanelElement, panelStyle, layout };
}
