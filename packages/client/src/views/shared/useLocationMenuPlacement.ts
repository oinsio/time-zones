import {
  type CSSProperties,
  type RefObject,
  useLayoutEffect,
  useState,
} from "react";
import { LOCATION_MENU_OFFSET_PX } from "@/constants";
import {
  getLocationMenuPlacement,
  LocationMenuSide,
} from "./locationMenuPlacement";

const SCROLL_EVENT = "scroll";
const RESIZE_EVENT = "resize";

export type LocationMenuPlacementState = {
  side: LocationMenuSide;
  /** Set when the menu fits on neither side; the menu then scrolls inside it. */
  maxHeightPx: number | undefined;
  /** The `position: fixed` place of the menu; `undefined` when the menu is not fixed. */
  fixedStyle: CSSProperties | undefined;
};

const DEFAULT_PLACEMENT: LocationMenuPlacementState = {
  side: LocationMenuSide.BELOW,
  maxHeightPx: undefined,
  fixedStyle: undefined,
};

/**
 * The place of an open location menu, from its button and its own height:
 * under the button when it fits, otherwise above it, otherwise on the larger
 * side with a limited height. Re-read once per opening and once per scroll
 * (of any element) or resize. In the fixed variant it also gives the
 * `position: fixed` style, right-aligned to the button.
 * Implements FR1 of add-grid-hour-cells-and-hour-frame (D5): the menu is not clipped by the panel's overflow.
 * Implements FR1, FR2, FR3, FR4, NFR-P1 of keep-location-menu-in-view-and-clear-range-after-share (D2).
 */
export function useLocationMenuPlacement(
  triggerRef: RefObject<HTMLElement | null>,
  menuRef: RefObject<HTMLElement | null>,
  isOpen: boolean,
  isMenuFixedToViewport: boolean,
): LocationMenuPlacementState {
  const [placement, setPlacement] = useState(DEFAULT_PLACEMENT);
  useLayoutEffect(() => {
    if (!isOpen) {
      setPlacement(DEFAULT_PLACEMENT);
      return;
    }
    const readPlacement = () => {
      const triggerBox = triggerRef.current?.getBoundingClientRect();
      if (triggerBox === undefined) return;
      const root = document.documentElement;
      const { side, maxHeightPx } = getLocationMenuPlacement({
        buttonTopPx: triggerBox.top,
        buttonBottomPx: triggerBox.bottom,
        menuHeightPx: menuRef.current?.scrollHeight ?? 0,
        viewportHeightPx: root.clientHeight,
      });
      const right = root.clientWidth - triggerBox.right;
      const fixedStyle: CSSProperties | undefined = isMenuFixedToViewport
        ? side === LocationMenuSide.BELOW
          ? {
              position: "fixed",
              top: triggerBox.bottom + LOCATION_MENU_OFFSET_PX,
              right,
            }
          : {
              position: "fixed",
              bottom:
                root.clientHeight - triggerBox.top + LOCATION_MENU_OFFSET_PX,
              right,
            }
        : undefined;
      setPlacement({ side, maxHeightPx, fixedStyle });
    };
    readPlacement();
    window.addEventListener(SCROLL_EVENT, readPlacement, true);
    window.addEventListener(RESIZE_EVENT, readPlacement);
    return () => {
      window.removeEventListener(SCROLL_EVENT, readPlacement, true);
      window.removeEventListener(RESIZE_EVENT, readPlacement);
    };
  }, [isOpen, isMenuFixedToViewport, triggerRef, menuRef]);
  return placement;
}

/** The inline style of an open menu: its fixed place and, when limited, its height with a scrolling overflow. */
export function getLocationMenuStyle({
  maxHeightPx,
  fixedStyle,
}: LocationMenuPlacementState): CSSProperties {
  return {
    ...fixedStyle,
    maxHeight: maxHeightPx,
    overflowY: maxHeightPx === undefined ? undefined : "auto",
  };
}
