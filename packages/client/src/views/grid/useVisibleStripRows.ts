import { useEffect, useRef, useState } from "react";
import { DATE_BAR_SELECTOR, MEETING_HANDLE_HEIGHT_PX } from "@/constants";
import type { MeetingHandleCandidateRows } from "./meetingHandleRow";
import { HOUR_STRIP_SELECTOR } from "./useMeetingHandleDrag";

const HALF = 2;

/** The bottom edge of the space a handle may stand in: the date bar's top, else the window's. */
const getViewportBottomPx = (): number =>
  document.querySelector(DATE_BAR_SELECTOR)?.getBoundingClientRect().top ??
  window.innerHeight;

/**
 * The rows on which a handle centred on the strip lies fully inside the
 * viewport above the date bar; every row when there is none.
 */
function measureCandidateRows(
  panel: HTMLElement,
  rowCount: number,
): MeetingHandleCandidateRows {
  const bottomPx = getViewportBottomPx();
  const halfHandlePx = MEETING_HANDLE_HEIGHT_PX / HALF;
  const candidateRows: number[] = [];
  panel.querySelectorAll(HOUR_STRIP_SELECTOR).forEach((strip, index) => {
    const { top, height } = strip.getBoundingClientRect();
    const centrePx = top + height / HALF;
    if (centrePx - halfHandlePx >= 0 && centrePx + halfHandlePx <= bottomPx) {
      candidateRows.push(index + 1);
    }
  });
  return candidateRows.length === 0
    ? { firstRow: 1, lastRow: rowCount }
    : {
        firstRow: candidateRows[0],
        lastRow: candidateRows[candidateRows.length - 1],
      };
}

/**
 * The grid rows a meeting handle may stand on so that it stays in view: the
 * rows whose strips can hold a whole handle on screen. Measured on mount and
 * on scroll, resize and panel resize, at most once per animation frame, and
 * published only when the run changed. While `isFrozen` (a handle drag) it keeps
 * the last value.
 * Implements FR7, NFR-P1, NFR-R1 of refine-meeting-range-entry-and-handles (D5).
 */
export function useVisibleStripRows(
  panel: HTMLElement | null,
  rowCount: number,
  isFrozen: boolean,
): MeetingHandleCandidateRows {
  const [candidateRows, setCandidateRows] =
    useState<MeetingHandleCandidateRows>({ firstRow: 1, lastRow: rowCount });
  const publishedRows = useRef(candidateRows);

  useEffect(() => {
    if (panel === null || isFrozen) return;
    let pendingFrame: number | undefined;
    const measure = () => {
      pendingFrame = undefined;
      const measuredRows = measureCandidateRows(panel, rowCount);
      const { firstRow, lastRow } = publishedRows.current;
      if (
        measuredRows.firstRow === firstRow &&
        measuredRows.lastRow === lastRow
      ) {
        return;
      }
      publishedRows.current = measuredRows;
      setCandidateRows(measuredRows);
    };
    const scheduleMeasure = () => {
      if (pendingFrame === undefined) {
        pendingFrame = window.requestAnimationFrame(measure);
      }
    };
    measure();
    window.addEventListener("scroll", scheduleMeasure, { passive: true });
    window.addEventListener("resize", scheduleMeasure);
    const observer = new ResizeObserver(scheduleMeasure);
    observer.observe(panel);
    return () => {
      if (pendingFrame !== undefined) window.cancelAnimationFrame(pendingFrame);
      window.removeEventListener("scroll", scheduleMeasure);
      window.removeEventListener("resize", scheduleMeasure);
      observer.disconnect();
    };
  }, [panel, rowCount, isFrozen]);

  return candidateRows;
}
