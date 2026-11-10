import { render } from "@testing-library/react";
import { vi } from "vitest";
import { MeetingHandle } from "@/model";
import type { PresentedMeetingHandle } from "@/presenter";
import { MeetingHandleSlider } from "./MeetingHandle";

export const END_HANDLE: PresentedMeetingHandle = {
  handle: MeetingHandle.END,
  label: "Meeting end",
  valueMinutes: 660,
  minMinutes: 555,
  maxMinutes: 1440,
  valueText: "11:00",
};
export const START_HANDLE: PresentedMeetingHandle = {
  handle: MeetingHandle.START,
  label: "Meeting start",
  valueMinutes: 540,
  minMinutes: 0,
  maxMinutes: 645,
  valueText: "09:00",
};
export const PITCH_PX = 40;
export const STRIP_HEIGHT_PX = 50;
export const ROW_HEIGHT_PX = 100;
export const PANEL_LEFT_PX = 0;
export const PANEL_RIGHT_PX = 390;
const STRIP_LEFT_PX = 16;
export const MAX_SCROLL_LEFT_PX = 300;

type HarnessOptions = {
  presented?: PresentedMeetingHandle;
  rowCount?: number;
  isScrollable?: boolean;
};

/**
 * A panel with `rowCount` stubbed hour strips (row `n` has its top at
 * `n * ROW_HEIGHT_PX`) and one handle; returns the callbacks and a scroll
 * position the strips' rects follow.
 */
export function renderHandle({
  presented = END_HANDLE,
  rowCount = 4,
  isScrollable = false,
}: HarnessOptions = {}) {
  const onMoveHandle = vi.fn();
  const onDragHandleTo = vi.fn();
  const { container } = render(
    <ul data-testid="panel">
      {Array.from({ length: rowCount }, (_, row) => (
        <li key={row}>
          <div data-hour-strip />
        </li>
      ))}
      <MeetingHandleSlider
        presented={presented}
        rowCount={rowCount}
        cellPitchPx={PITCH_PX}
        isScrollable={isScrollable}
        onMoveHandle={onMoveHandle}
        onDragHandleTo={onDragHandleTo}
      />
    </ul>,
  );
  const panel = container.querySelector("ul") as HTMLUListElement;
  return { container, panel, onMoveHandle, onDragHandleTo };
}

/**
 * Stubs the rects of the panel and its strips (call before rendering). The
 * strips' left follows the panel's `scrollLeft`, which the returned controls
 * read and write; `panel.scrollLeft` is bound to it by `bindScrollLeft`.
 */
export function installPanelGeometry() {
  let scrollLeftPx = 0;
  vi.spyOn(Element.prototype, "getBoundingClientRect").mockImplementation(
    function (this: Element) {
      if (this.hasAttribute("data-hour-strip")) {
        const row = Array.from(
          document.querySelectorAll("[data-hour-strip]"),
        ).indexOf(this);
        return {
          left: STRIP_LEFT_PX - scrollLeftPx,
          top: row * ROW_HEIGHT_PX,
          height: STRIP_HEIGHT_PX,
        } as DOMRect;
      }
      return {
        left: PANEL_LEFT_PX,
        right: PANEL_RIGHT_PX,
        top: 0,
        height: 400,
      } as DOMRect;
    },
  );
  return {
    getScrollLeft: () => scrollLeftPx,
    bindScrollLeft: (panel: HTMLElement) => {
      Object.defineProperty(panel, "scrollLeft", {
        configurable: true,
        get: () => scrollLeftPx,
        set: (value: number) => {
          scrollLeftPx = Math.min(Math.max(value, 0), MAX_SCROLL_LEFT_PX);
        },
      });
    },
  };
}
