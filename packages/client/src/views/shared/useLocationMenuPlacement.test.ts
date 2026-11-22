// Verifies FR1, FR2, FR3, NFR-P1 of keep-location-menu-in-view-and-clear-range-after-share.
// Verifies FR1 of add-grid-hour-cells-and-hour-frame (D5): the menu of a grid row is placed from its button.
import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { LOCATION_MENU_OFFSET_PX } from "@/constants";
import { LocationMenuSide } from "./locationMenuPlacement";
import { useLocationMenuPlacement } from "./useLocationMenuPlacement";

const BUTTON_TOP_PX = 56;
const BUTTON_BOTTOM_PX = 100;
const BUTTON_RIGHT_PX = 300;
const NEAR_BOTTOM_TOP_PX = 700;
const NEAR_BOTTOM_BOTTOM_PX = 744;
const MENU_HEIGHT_PX = 184;
const VIEWPORT_HEIGHT_PX = 800;

function buildButtonAndMenu() {
  const trigger = document.createElement("button");
  const box = { top: BUTTON_TOP_PX, bottom: BUTTON_BOTTOM_PX };
  const getBoundingClientRect = vi
    .spyOn(trigger, "getBoundingClientRect")
    .mockImplementation(() => ({ ...box, right: BUTTON_RIGHT_PX }) as DOMRect);
  const menu = document.createElement("div");
  const readScrollHeight = vi.fn(() => MENU_HEIGHT_PX);
  Object.defineProperty(menu, "scrollHeight", { get: readScrollHeight });
  return {
    triggerRef: { current: trigger },
    menuRef: { current: menu },
    getBoundingClientRect,
    readScrollHeight,
    moveButton: (top: number, bottom: number) => {
      box.top = top;
      box.bottom = bottom;
    },
  };
}

function useFixedPlacement(
  refs: ReturnType<typeof buildButtonAndMenu>,
  isOpen: boolean,
) {
  return useLocationMenuPlacement(refs.triggerRef, refs.menuRef, isOpen, true);
}

beforeEach(() => {
  vi.spyOn(document.documentElement, "clientHeight", "get").mockReturnValue(
    VIEWPORT_HEIGHT_PX,
  );
});
afterEach(() => vi.restoreAllMocks());

describe("useLocationMenuPlacement", () => {
  it("should give the default placement while closed", () => {
    const refs = buildButtonAndMenu();

    const { result } = renderHook(() => useFixedPlacement(refs, false));

    expect(result.current).toMatchObject({
      side: LocationMenuSide.BELOW,
      style: {},
    });
  });

  it("should place a fixed menu under the button and right-aligned to it", () => {
    const refs = buildButtonAndMenu();

    const { result } = renderHook(() => useFixedPlacement(refs, true));

    expect(result.current.style).toMatchObject({
      position: "fixed",
      top: BUTTON_BOTTOM_PX + LOCATION_MENU_OFFSET_PX,
      right: document.documentElement.clientWidth - BUTTON_RIGHT_PX,
    });
  });

  it("should give no fixed style for a menu that is not fixed", () => {
    const refs = buildButtonAndMenu();

    const { result } = renderHook(() =>
      useLocationMenuPlacement(refs.triggerRef, refs.menuRef, true, false),
    );

    expect(result.current.style.position).toBeUndefined();
    expect(result.current.side).toBe(LocationMenuSide.BELOW);
  });

  it("should give the default placement without a button", () => {
    const refs = buildButtonAndMenu();

    const { result } = renderHook(() =>
      useLocationMenuPlacement({ current: null }, refs.menuRef, true, true),
    );

    expect(result.current.style.position).toBeUndefined();
  });

  describe("near the bottom of the viewport", () => {
    function openNearBottom() {
      const refs = buildButtonAndMenu();
      refs.moveButton(NEAR_BOTTOM_TOP_PX, NEAR_BOTTOM_BOTTOM_PX);
      return refs;
    }

    it("should open above the button", () => {
      const refs = openNearBottom();

      const { result } = renderHook(() => useFixedPlacement(refs, true));

      expect(result.current.side).toBe(LocationMenuSide.ABOVE);
    });

    it("should anchor a fixed menu above by its bottom edge", () => {
      const refs = openNearBottom();

      const { result } = renderHook(() => useFixedPlacement(refs, true));

      expect(result.current.style).toMatchObject({
        position: "fixed",
        bottom:
          VIEWPORT_HEIGHT_PX - NEAR_BOTTOM_TOP_PX + LOCATION_MENU_OFFSET_PX,
        right: document.documentElement.clientWidth - BUTTON_RIGHT_PX,
      });
    });

    it("should change the side after a scroll that moves the button near the bottom", () => {
      const refs = buildButtonAndMenu();
      const { result } = renderHook(() => useFixedPlacement(refs, true));
      expect(result.current.side).toBe(LocationMenuSide.BELOW);

      refs.moveButton(NEAR_BOTTOM_TOP_PX, NEAR_BOTTOM_BOTTOM_PX);
      act(() => void window.dispatchEvent(new Event("scroll")));

      expect(result.current.side).toBe(LocationMenuSide.ABOVE);
    });
  });

  it("should read the button once per opening", () => {
    const refs = buildButtonAndMenu();

    renderHook(() => useFixedPlacement(refs, true));

    expect(refs.getBoundingClientRect).toHaveBeenCalledTimes(1);
  });

  it("should re-read the button once on a scroll of any element", () => {
    const refs = buildButtonAndMenu();
    renderHook(() => useFixedPlacement(refs, true));
    const scrolledPanel = document.createElement("div");
    document.body.append(scrolledPanel);
    refs.getBoundingClientRect.mockClear();

    act(() => void scrolledPanel.dispatchEvent(new Event("scroll")));

    expect(refs.getBoundingClientRect).toHaveBeenCalledTimes(1);
  });

  it("should read the menu height once per opening and once per event", () => {
    const refs = buildButtonAndMenu();
    renderHook(() => useFixedPlacement(refs, true));
    expect(refs.readScrollHeight).toHaveBeenCalledTimes(1);

    act(() => void window.dispatchEvent(new Event("scroll")));

    expect(refs.readScrollHeight).toHaveBeenCalledTimes(2);
  });

  it("should forget the placement when the menu closes", () => {
    const refs = buildButtonAndMenu();
    refs.moveButton(NEAR_BOTTOM_TOP_PX, NEAR_BOTTOM_BOTTOM_PX);
    const { result, rerender } = renderHook(
      ({ isOpen }) => useFixedPlacement(refs, isOpen),
      { initialProps: { isOpen: true } },
    );
    expect(result.current.side).toBe(LocationMenuSide.ABOVE);

    rerender({ isOpen: false });

    expect(result.current).toMatchObject({
      side: LocationMenuSide.BELOW,
      style: {},
    });
  });

  it("should re-read the button on a resize", () => {
    const refs = buildButtonAndMenu();
    renderHook(() => useFixedPlacement(refs, true));
    refs.getBoundingClientRect.mockClear();

    act(() => void window.dispatchEvent(new Event("resize")));

    expect(refs.getBoundingClientRect).toHaveBeenCalledTimes(1);
  });

  it("should create no ResizeObserver", () => {
    const observerSpy = vi.fn();
    vi.stubGlobal("ResizeObserver", observerSpy);
    const refs = buildButtonAndMenu();

    renderHook(() => useFixedPlacement(refs, true));

    expect(observerSpy).not.toHaveBeenCalled();
    vi.unstubAllGlobals();
  });

  it("should stop listening after unmount", () => {
    const refs = buildButtonAndMenu();
    const { unmount } = renderHook(() => useFixedPlacement(refs, true));
    unmount();
    refs.getBoundingClientRect.mockClear();

    window.dispatchEvent(new Event("resize"));
    document.body.dispatchEvent(new Event("scroll"));

    expect(refs.getBoundingClientRect).not.toHaveBeenCalled();
  });
});
