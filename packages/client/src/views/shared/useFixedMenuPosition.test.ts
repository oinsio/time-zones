// Verifies FR1 of add-grid-hour-cells-and-hour-frame (D5): the menu of a grid row is placed from its button.
import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { LOCATION_MENU_OFFSET_PX } from "@/constants";
import { useFixedMenuPosition } from "./useFixedMenuPosition";

const BUTTON_BOTTOM_PX = 100;
const BUTTON_RIGHT_PX = 300;

function buildTrigger() {
  const trigger = document.createElement("button");
  const getBoundingClientRect = vi
    .spyOn(trigger, "getBoundingClientRect")
    .mockReturnValue({
      bottom: BUTTON_BOTTOM_PX,
      right: BUTTON_RIGHT_PX,
    } as DOMRect);
  return {
    trigger,
    triggerRef: { current: trigger },
    getBoundingClientRect,
  };
}

const emptyRef = { current: null };

describe("useFixedMenuPosition", () => {
  it("should give no position while inactive", () => {
    const { triggerRef } = buildTrigger();

    const { result } = renderHook(() =>
      useFixedMenuPosition(triggerRef, false),
    );

    expect(result.current).toBeUndefined();
  });

  it("should place the menu under the button and right-aligned to it", () => {
    const { triggerRef } = buildTrigger();

    const { result } = renderHook(() => useFixedMenuPosition(triggerRef, true));

    expect(result.current).toEqual({
      position: "fixed",
      top: BUTTON_BOTTOM_PX + LOCATION_MENU_OFFSET_PX,
      right: document.documentElement.clientWidth - BUTTON_RIGHT_PX,
    });
  });

  it("should give no position without a button", () => {
    const { result } = renderHook(() => useFixedMenuPosition(emptyRef, true));

    expect(result.current).toBeUndefined();
  });

  it("should forget the position when it becomes inactive", () => {
    const { triggerRef } = buildTrigger();
    const { result, rerender } = renderHook(
      ({ isActive }) => useFixedMenuPosition(triggerRef, isActive),
      { initialProps: { isActive: true } },
    );

    rerender({ isActive: false });

    expect(result.current).toBeUndefined();
  });

  it("should re-read the button on a scroll of any element", () => {
    const { triggerRef, getBoundingClientRect } = buildTrigger();
    renderHook(() => useFixedMenuPosition(triggerRef, true));
    const scrolledPanel = document.createElement("div");
    document.body.append(scrolledPanel);
    getBoundingClientRect.mockClear();

    act(() => void scrolledPanel.dispatchEvent(new Event("scroll")));

    expect(getBoundingClientRect).toHaveBeenCalledTimes(1);
  });

  it("should re-read the button on a resize", () => {
    const { triggerRef, getBoundingClientRect } = buildTrigger();
    renderHook(() => useFixedMenuPosition(triggerRef, true));
    getBoundingClientRect.mockClear();

    act(() => void window.dispatchEvent(new Event("resize")));

    expect(getBoundingClientRect).toHaveBeenCalledTimes(1);
  });

  it("should stop listening after unmount", () => {
    const { triggerRef, getBoundingClientRect } = buildTrigger();
    const { unmount } = renderHook(() =>
      useFixedMenuPosition(triggerRef, true),
    );
    unmount();
    getBoundingClientRect.mockClear();

    window.dispatchEvent(new Event("resize"));
    document.body.dispatchEvent(new Event("scroll"));

    expect(getBoundingClientRect).not.toHaveBeenCalled();
  });
});
