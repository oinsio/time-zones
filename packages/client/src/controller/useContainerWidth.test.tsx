// Verifies FR4 of add-main-page-scaffold: the host measures its own container.
import { renderHook } from "@testing-library/react";
import { installResizeObserverFake } from "@/test/resizeObserverFake";
import { useContainerWidth } from "./useContainerWidth";

const INITIAL_WIDTH = 0;
const MEASURED_WIDTH = 640;
const RESIZED_WIDTH = 1024;

const renderWidthHook = () => {
  const containerElement = document.createElement("div");
  return renderHook(() => useContainerWidth({ current: containerElement }));
};

describe("useContainerWidth", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("should report zero width before the first measurement", () => {
    installResizeObserverFake();
    const { result } = renderWidthHook();
    expect(result.current).toBe(INITIAL_WIDTH);
  });

  it("should report the width the observer measures", () => {
    const resizeObserver = installResizeObserverFake();
    const { result } = renderWidthHook();
    resizeObserver.reportWidth(MEASURED_WIDTH);
    expect(result.current).toBe(MEASURED_WIDTH);
  });

  it("should follow later width changes", () => {
    const resizeObserver = installResizeObserverFake();
    const { result } = renderWidthHook();
    resizeObserver.reportWidth(MEASURED_WIDTH);
    resizeObserver.reportWidth(RESIZED_WIDTH);
    expect(result.current).toBe(RESIZED_WIDTH);
  });

  it("should stop observing when unmounted", () => {
    const resizeObserver = installResizeObserverFake();
    const { unmount } = renderWidthHook();
    unmount();
    expect(resizeObserver.observedCount()).toBe(0);
  });

  it("should not fail when the ref holds no element", () => {
    installResizeObserverFake();
    const { result } = renderHook(() => useContainerWidth({ current: null }));
    expect(result.current).toBe(INITIAL_WIDTH);
  });
});
