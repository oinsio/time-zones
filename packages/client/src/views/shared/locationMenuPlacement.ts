import {
  LOCATION_MENU_OFFSET_PX,
  LOCATION_MENU_VIEWPORT_MARGIN_PX,
} from "@/constants";

/** Where an open location menu lies relative to its button. */
export enum LocationMenuSide {
  BELOW = "BELOW",
  ABOVE = "ABOVE",
}

export type LocationMenuPlacement = {
  side: LocationMenuSide;
  /** Set only when the menu fits on neither side; its items then scroll. */
  maxHeightPx: number | undefined;
};

/**
 * The side of its button an open location menu takes so that it lies inside
 * the viewport: below when it fits, otherwise above, otherwise the larger
 * side with a limited height. `buttonBox` is the button's box in the viewport and
 * `menuHeightPx` the natural height of the menu (its scroll height).
 * Implements FR1, FR2 of keep-location-menu-in-view-and-clear-range-after-share (D1).
 */
export function getLocationMenuPlacement(
  buttonBox: Pick<DOMRect, "top" | "bottom">,
  menuHeightPx: number,
  viewportHeightPx: number,
): LocationMenuPlacement {
  const spacingPx = LOCATION_MENU_OFFSET_PX + LOCATION_MENU_VIEWPORT_MARGIN_PX;
  const roomBelowPx = viewportHeightPx - buttonBox.bottom - spacingPx;
  const roomAbovePx = buttonBox.top - spacingPx;
  // Below wins when the menu fits there or when below is the larger room.
  const side =
    menuHeightPx <= roomBelowPx || roomBelowPx >= roomAbovePx
      ? LocationMenuSide.BELOW
      : LocationMenuSide.ABOVE;
  const roomPx = side === LocationMenuSide.BELOW ? roomBelowPx : roomAbovePx;
  return { side, maxHeightPx: menuHeightPx <= roomPx ? undefined : roomPx };
}
