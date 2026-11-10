// Verifies NFR-R1, NFR-R2, UX3 of add-grid-hour-cells-and-hour-frame (D5).
import { act, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { installResizeObserverFake } from "@/test/resizeObserverFake";
import { useHourStripScroll } from "./useHourStripScroll";

const CELL_COUNT = 24;
const SCROLL_WIDTH = 24 * 36 + 32;
let panelWidth = 390;

function Panel({ hourFrameIndex }: { hourFrameIndex: number }) {
  const { panelRef, panelStyle } = useHourStripScroll(
    hourFrameIndex,
    CELL_COUNT,
  );
  return <ul data-testid="panel" ref={panelRef} style={panelStyle} />;
}

const panelOf = (container: HTMLElement) =>
  container.querySelector("ul") as HTMLUListElement;

describe("useHourStripScroll", () => {
  let resizeObserver: ReturnType<typeof installResizeObserverFake>;
  beforeEach(() => {
    panelWidth = 390;
    resizeObserver = installResizeObserverFake();
    vi.spyOn(HTMLElement.prototype, "clientWidth", "get").mockImplementation(
      () => panelWidth,
    );
    vi.spyOn(HTMLElement.prototype, "scrollWidth", "get").mockReturnValue(
      SCROLL_WIDTH,
    );
  });
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it("should set the CSS variables from the measured width", () => {
    const { container } = render(<Panel hourFrameIndex={0} />);

    const style = panelOf(container).style;
    expect(style.getPropertyValue("--grid-panel-width")).toBe("390px");
    expect(style.getPropertyValue("--hour-cell-count")).toBe("24");
    expect(style.getPropertyValue("--hour-cell-pitch")).toBe(
      `${(390 - 32) / 9}px`,
    );
  });

  it("should share the strip equally while the cells fit", () => {
    panelWidth = 1432;

    const { container } = render(<Panel hourFrameIndex={0} />);

    expect(panelOf(container).style.getPropertyValue("--hour-cell-pitch")).toBe(
      "58.333333333333336px",
    );
  });

  it("should follow a change of the width", () => {
    const { container } = render(<Panel hourFrameIndex={0} />);

    panelWidth = 1432;
    resizeObserver.reportWidth(1432);

    expect(
      panelOf(container).style.getPropertyValue("--grid-panel-width"),
    ).toBe("1432px");
  });

  it("should scroll the framed column into view on mount", () => {
    const { container } = render(<Panel hourFrameIndex={12} />);

    expect(panelOf(container).scrollLeft).toBeGreaterThan(0);
  });

  it("should not scroll when the framed column is visible", () => {
    const { container } = render(<Panel hourFrameIndex={3} />);

    expect(panelOf(container).scrollLeft).toBe(0);
  });

  it("should scroll when the frame moves out of the visible part", () => {
    const { container, rerender } = render(<Panel hourFrameIndex={3} />);
    const panel = panelOf(container);
    panel.scrollTo = vi.fn();

    act(() => rerender(<Panel hourFrameIndex={23} />));

    expect(panel.scrollTo).toHaveBeenCalledWith(
      expect.objectContaining({ behavior: "smooth" }),
    );
  });

  it("should not scroll when the frame stays in the visible part", () => {
    const { container, rerender } = render(<Panel hourFrameIndex={3} />);
    const panel = panelOf(container);
    panel.scrollTo = vi.fn();

    act(() => rerender(<Panel hourFrameIndex={4} />));

    expect(panel.scrollTo).not.toHaveBeenCalled();
    expect(panel.scrollLeft).toBe(0);
  });
});
