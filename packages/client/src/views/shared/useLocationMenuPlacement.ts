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
  /** The inline style of the open menu: its fixed place (fixed variant) and its limited height with scrolling items, when it fits on neither side. */
  style: CSSProperties;
  /** The position classes of the open menu for its side and variant. */
  positionClassName?: string;
};

const CLOSED_PLACEMENT: LocationMenuPlacementState = {
  side: LocationMenuSide.BELOW,
  style: {},
};

/**
 * Implements FR1 of keep-location-menu-in-view-and-clear-range-after-share (D2):
 * the position classes of the menu for its side and variant.
 */
function getLocationMenuPositionClasses(
  isMenuFixedToViewport: boolean,
  side: LocationMenuSide,
): string {
  if (isMenuFixedToViewport) return "fixed";
  return side === LocationMenuSide.BELOW
    ? "absolute right-0 top-full mt-1"
    : "absolute right-0 bottom-full mb-1";
}

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
  const [placement, setPlacement] =
    useState<LocationMenuPlacementState>(CLOSED_PLACEMENT);
  useLayoutEffect(() => {
    if (!isOpen) {
      setPlacement(CLOSED_PLACEMENT);
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
      const fixedStyle: CSSProperties = !isMenuFixedToViewport
        ? {}
        : {
            position: "fixed",
            right: root.clientWidth - triggerBox.right,
            ...(side === LocationMenuSide.BELOW
              ? { top: triggerBox.bottom + LOCATION_MENU_OFFSET_PX }
              : {
                  bottom:
                    root.clientHeight -
                    triggerBox.top +
                    LOCATION_MENU_OFFSET_PX,
                }),
          };
      setPlacement({
        side,
        style: {
          ...fixedStyle,
          ...(maxHeightPx === undefined
            ? {}
            : { maxHeight: maxHeightPx, overflowY: "auto" as const }),
        },
      });
    };
    readPlacement();
    window.addEventListener(SCROLL_EVENT, readPlacement, true);
    window.addEventListener(RESIZE_EVENT, readPlacement);
    return () => {
      window.removeEventListener(SCROLL_EVENT, readPlacement, true);
      window.removeEventListener(RESIZE_EVENT, readPlacement);
    };
  }, [isOpen, isMenuFixedToViewport, triggerRef, menuRef]);
  return {
    ...placement,
    positionClassName: getLocationMenuPositionClasses(
      isMenuFixedToViewport,
      placement.side,
    ),
  };
}
