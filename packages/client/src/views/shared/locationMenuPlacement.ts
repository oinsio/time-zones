import {
  LOCATION_MENU_OFFSET_PX,
  LOCATION_MENU_VIEWPORT_MARGIN_PX,
} from "@/constants";

/** Where an open location menu lies relative to its button. */
export enum LocationMenuSide {
  BELOW = "BELOW",
  ABOVE = "ABOVE",
}

export type LocationMenuPlacementInput = {
  /** The button's box in the viewport. */
  buttonTopPx: number;
  buttonBottomPx: number;
  /** The natural height of the menu (its scroll height). */
  menuHeightPx: number;
  viewportHeightPx: number;
};

export type LocationMenuPlacement = {
  side: LocationMenuSide;
  /** Set only when the menu fits on neither side; its items then scroll. */
  maxHeightPx: number | undefined;
};

/**
 * The side of its button an open location menu takes so that it lies inside
 * the viewport: below when it fits, otherwise above, otherwise the larger
 * side with a limited height.
 * Implements FR1, FR2 of keep-location-menu-in-view-and-clear-range-after-share (D1).
 */
export function getLocationMenuPlacement({
  buttonTopPx,
  buttonBottomPx,
  menuHeightPx,
  viewportHeightPx,
}: LocationMenuPlacementInput): LocationMenuPlacement {
  const spacingPx = LOCATION_MENU_OFFSET_PX + LOCATION_MENU_VIEWPORT_MARGIN_PX;
  const roomBelowPx = viewportHeightPx - buttonBottomPx - spacingPx;
  const roomAbovePx = buttonTopPx - spacingPx;
  if (menuHeightPx <= roomBelowPx) {
    return { side: LocationMenuSide.BELOW, maxHeightPx: undefined };
  }
  if (menuHeightPx <= roomAbovePx) {
    return { side: LocationMenuSide.ABOVE, maxHeightPx: undefined };
  }
  return roomBelowPx >= roomAbovePx
    ? { side: LocationMenuSide.BELOW, maxHeightPx: roomBelowPx }
    : { side: LocationMenuSide.ABOVE, maxHeightPx: roomAbovePx };
}

/**
 * The Tailwind position classes of an open menu: `fixed` is placed by inline style;
 * otherwise it is absolute in its row, on the given side of the button.
 * Implements FR1 of keep-location-menu-in-view-and-clear-range-after-share (D2).
 */
export function getLocationMenuPositionClass(
  isMenuFixedToViewport: boolean,
  side: LocationMenuSide,
): string {
  if (isMenuFixedToViewport) return "fixed";
  return side === LocationMenuSide.BELOW
    ? "absolute right-0 top-full mt-1"
    : "absolute right-0 bottom-full mb-1";
}
