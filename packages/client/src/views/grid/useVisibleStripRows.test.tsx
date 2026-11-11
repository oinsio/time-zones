// Verifies FR7, NFR-P1 of refine-meeting-range-entry-and-handles.
import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useVisibleStripRows } from "./useVisibleStripRows";

const ROW_COUNT = 12;
const PITCH_PX = 50;
const BAR_TOP_PX = 400;

type Geometry = { stripHeightPx: number; firstTopPx: number; barTopPx: number };
const DEFAULT_GEOMETRY: Geometry = {
  stripHeightPx: 38,
  firstTopPx: 60,
  barTopPx: BAR_TOP_PX,
};

let geometry: Geometry;
let scrollPx: number;
let frameCallbacks: FrameRequestCallback[];
let stripReads: number;
let panel: HTMLElement;
let dateBar: HTMLElement | undefined;

const flushFrame = () =>
  act(() => {
    const pending = frameCallbacks;
    frameCallbacks = [];
    for (const callback of pending) callback(0);
  });
const scrollTo = (valuePx: number) => {
  scrollPx = valuePx;
  act(() => {
    window.dispatchEvent(new Event("scroll"));
  });
};

beforeEach(() => {
  geometry = { ...DEFAULT_GEOMETRY };
  scrollPx = 0;
  frameCallbacks = [];
  stripReads = 0;
  panel = document.createElement("ul");
  for (let row = 0; row < ROW_COUNT; row += 1) {
    const strip = document.createElement("div");
    strip.setAttribute("data-hour-strip", "");
    panel.append(strip);
  }
  dateBar = document.createElement("footer");
  dateBar.setAttribute("data-date-bar", "");
  document.body.append(panel, dateBar);
  vi.spyOn(window, "requestAnimationFrame").mockImplementation((callback) => {
    frameCallbacks.push(callback);
    return frameCallbacks.length;
  });
  vi.spyOn(window, "cancelAnimationFrame").mockImplementation(() => {});
  vi.spyOn(Element.prototype, "getBoundingClientRect").mockImplementation(
    function (this: Element) {
      if (this === dateBar) return { top: geometry.barTopPx } as DOMRect;
      stripReads += 1;
      const row = Array.from(panel.children).indexOf(this);
      return {
        top: geometry.firstTopPx + row * PITCH_PX - scrollPx,
        height: geometry.stripHeightPx,
      } as DOMRect;
    },
  );
});

afterEach(() => {
  panel.remove();
  dateBar?.remove();
  vi.restoreAllMocks();
});

const renderRows = (isFrozen = false) =>
  renderHook((props) => useVisibleStripRows(panel, ROW_COUNT, props.isFrozen), {
    initialProps: { isFrozen },
  });

describe("useVisibleStripRows", () => {
  it("should return the rows whose centred handle fits at scroll top", () => {
    const { result } = renderRows();
    expect(result.current).toEqual({ firstRow: 1, lastRow: 6 });
  });

  it("should return the new run after a scroll event", () => {
    const { result } = renderRows();
    scrollTo(100);
    flushFrame();
    expect(result.current).toEqual({ firstRow: 2, lastRow: 8 });
  });

  it("should measure once for three scroll events before one frame", () => {
    renderRows();
    stripReads = 0;
    scrollTo(10);
    scrollTo(20);
    scrollTo(30);
    expect(frameCallbacks).toHaveLength(1);
    flushFrame();
    expect(stripReads).toBe(ROW_COUNT);
  });

  it("should not render again for an unchanged run", () => {
    let renderCount = 0;
    renderHook(() => {
      renderCount += 1;
      return useVisibleStripRows(panel, ROW_COUNT, false);
    });
    const rendersBefore = renderCount;
    scrollTo(1);
    flushFrame();
    expect(renderCount).toBe(rendersBefore);
  });

  it("should skip a strip whose handle would start above the viewport", () => {
    geometry.firstTopPx = 2;
    const { result } = renderRows();
    expect(result.current.firstRow).toBe(2);
  });

  it("should skip a strip whose handle would reach under the date bar", () => {
    geometry.firstTopPx = 30;
    geometry.barTopPx = 30 + PITCH_PX + geometry.stripHeightPx + 2;
    const { result } = renderRows();
    expect(result.current).toEqual({ firstRow: 1, lastRow: 1 });
  });

  it("should fall back to every row when no row is a candidate", () => {
    geometry.barTopPx = 10;
    const { result } = renderRows();
    expect(result.current).toEqual({ firstRow: 1, lastRow: ROW_COUNT });
  });

  it("should keep the last value while frozen", () => {
    const { result, rerender } = renderRows();
    rerender({ isFrozen: true });
    scrollTo(100);
    flushFrame();
    expect(result.current).toEqual({ firstRow: 1, lastRow: 6 });
  });

  it("should measure again when the freeze ends", () => {
    const { result, rerender } = renderRows(true);
    scrollTo(100);
    rerender({ isFrozen: false });
    expect(result.current).toEqual({ firstRow: 2, lastRow: 8 });
  });

  it("should count a strip whose handle ends exactly at the date bar", () => {
    geometry.barTopPx = 103;
    const { result } = renderRows();
    expect(result.current).toEqual({ firstRow: 1, lastRow: 1 });
  });

  it("should cancel the pending frame and stop listening on unmount", () => {
    const { unmount } = renderRows();
    scrollTo(10);
    unmount();
    expect(window.cancelAnimationFrame).toHaveBeenCalledWith(1);
    vi.mocked(window.requestAnimationFrame).mockClear();
    act(() => {
      window.dispatchEvent(new Event("resize"));
    });
    expect(window.requestAnimationFrame).not.toHaveBeenCalled();
  });

  it("should not cancel a frame on unmount when none is pending", () => {
    const { unmount } = renderRows();
    unmount();
    expect(window.cancelAnimationFrame).not.toHaveBeenCalled();
  });

  it("should use the window height without a date bar", () => {
    dateBar?.remove();
    dateBar = undefined;
    vi.spyOn(window, "innerHeight", "get").mockReturnValue(200);
    const { result } = renderRows();
    expect(result.current).toEqual({ firstRow: 1, lastRow: 2 });
  });
});
