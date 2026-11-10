// Implements FR8, UX3 of fix-grid-meeting-range-lock-and-layering (D7): which points of a frame border a row header covers.
import type { Page } from "@playwright/test";

export const BORDER_SAMPLE_STEP_PX = 2;
const BORDER_INSET_PX = 1;
const STICKY_BOX_SELECTOR = ".sticky";
const ROW_NOTE_SELECTOR = "p.bg-notice";
const INPUT_SELECTOR = "input";
const TRANSPARENT_BACKGROUND = "rgba(0, 0, 0, 0)";

export type BorderCoverage = {
  /** Points of a border inside a sticky box, per row. */
  sampledPointsPerRow: number[];
  /** Of those, the points no element with a background covers. */
  emptyPointsPerRow: number[];
  /** Points covered by a background that holds no glyph, note or input there. */
  coveredPoints: string[];
};

/**
 * Samples both borders of a frame where they cross a row's sticky header or
 * notes box and inspects only the descendants of that box: the hour cells and
 * the row below the frame are never looked at.
 */
export function measureBorderCoverage(
  page: Page,
  frameSelector: string,
): Promise<BorderCoverage> {
  return page.evaluate(
    ({
      frameSelector: frame,
      step,
      inset,
      stickySelector,
      noteSelector,
      inputSelector,
      transparent,
    }) => {
      const frameElement = document.querySelector(frame);
      if (frameElement === null)
        throw new Error(`No frame ${frame} on the page`);
      const frameBox = frameElement.getBoundingClientRect();
      const borderXs = [frameBox.left + inset, frameBox.right - inset];
      /** The point lies in the glyph's column and in the element's own line box (the leading above and below the glyphs is part of it). */
      const holdsGlyphAt = (element: Element, x: number, y: number) => {
        const elementRect = element.getBoundingClientRect();
        if (y < elementRect.top || y > elementRect.bottom) return false;
        const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
        for (let node = walker.nextNode(); node; node = walker.nextNode()) {
          if (node.parentElement !== element || !node.textContent?.trim())
            continue;
          const range = document.createRange();
          range.selectNodeContents(node);
          for (const rect of range.getClientRects()) {
            if (x >= rect.left && x <= rect.right) return true;
          }
        }
        return false;
      };
      const report: BorderCoverage = {
        sampledPointsPerRow: [],
        emptyPointsPerRow: [],
        coveredPoints: [],
      };
      const rows = document.querySelectorAll(
        'ul[data-row-variant="grid-row"] > li:not([aria-hidden])',
      );
      rows.forEach((row, rowIndex) => {
        let sampled = 0;
        let empty = 0;
        row.querySelectorAll(stickySelector).forEach((box) => {
          const boxRect = box.getBoundingClientRect();
          for (const x of borderXs) {
            if (x < boxRect.left || x > boxRect.right) continue;
            for (let y = boxRect.top; y < boxRect.bottom; y += step) {
              sampled += 1;
              const covering = document
                .elementsFromPoint(x, y)
                .filter(
                  (element) =>
                    box.contains(element) &&
                    element !== box &&
                    getComputedStyle(element).backgroundColor !== transparent,
                );
              if (covering.length === 0) empty += 1;
              for (const element of covering) {
                const isAllowed =
                  element.closest(noteSelector) !== null ||
                  element.closest(inputSelector) !== null ||
                  holdsGlyphAt(element, x, y);
                if (!isAllowed)
                  report.coveredPoints.push(
                    `row ${rowIndex} at ${x},${y}: <${element.tagName.toLowerCase()} class="${element.className}">`,
                  );
              }
            }
          }
        });
        if (row.querySelector(stickySelector) === null) return;
        report.sampledPointsPerRow.push(sampled);
        report.emptyPointsPerRow.push(empty);
      });
      return report;
    },
    {
      frameSelector,
      step: BORDER_SAMPLE_STEP_PX,
      inset: BORDER_INSET_PX,
      stickySelector: STICKY_BOX_SELECTOR,
      noteSelector: ROW_NOTE_SELECTOR,
      inputSelector: INPUT_SELECTOR,
      transparent: TRANSPARENT_BACKGROUND,
    },
  );
}
