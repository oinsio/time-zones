// Verifies FR1, FR2, NFR-R1, UX1, UX2 of keep-location-menu-in-view-and-clear-range-after-share.
import { describe, expect, it } from "vitest";
import {
  getLocationMenuPlacement,
  LocationMenuSide,
} from "./locationMenuPlacement";

const MENU_HEIGHT_PX = 184;

function place(
  buttonTopPx: number,
  buttonBottomPx: number,
  viewportHeightPx: number,
  menuHeightPx = MENU_HEIGHT_PX,
) {
  return getLocationMenuPlacement({
    buttonTopPx,
    buttonBottomPx,
    menuHeightPx,
    viewportHeightPx,
  });
}

describe("getLocationMenuPlacement", () => {
  it.each([
    {
      top: 100,
      bottom: 144,
      side: LocationMenuSide.BELOW,
      maxHeight: undefined,
    },
    {
      top: 360,
      bottom: 404,
      side: LocationMenuSide.BELOW,
      maxHeight: undefined,
    },
    {
      top: 420,
      bottom: 464,
      side: LocationMenuSide.ABOVE,
      maxHeight: undefined,
    },
    {
      top: 550,
      bottom: 594,
      side: LocationMenuSide.ABOVE,
      maxHeight: undefined,
    },
  ])(
    "should choose $side for a button at $top-$bottom in a viewport of 600",
    ({ top, bottom, side, maxHeight }) => {
      expect(place(top, bottom, 600)).toEqual({ side, maxHeightPx: maxHeight });
    },
  );

  it.each([
    { top: 100, bottom: 144, side: LocationMenuSide.BELOW, maxHeight: 148 },
    { top: 160, bottom: 204, side: LocationMenuSide.ABOVE, maxHeight: 152 },
  ])(
    "should limit the height to $maxHeight on the larger side $side in a viewport of 300",
    ({ top, bottom, side, maxHeight }) => {
      expect(place(top, bottom, 300)).toEqual({ side, maxHeightPx: maxHeight });
    },
  );

  it("should open below without a limit when the menu is exactly as high as the room below", () => {
    // room below = 600 - 144 - 4 - 4 = 448
    expect(place(100, 144, 600, 448)).toEqual({
      side: LocationMenuSide.BELOW,
      maxHeightPx: undefined,
    });
  });

  it("should open above when the menu is one pixel higher than the room below and fits above", () => {
    expect(place(500, 544, 600, 53)).toEqual({
      side: LocationMenuSide.ABOVE,
      maxHeightPx: undefined,
    });
  });

  it("should open below with a limit when both rooms are equal and too small", () => {
    // room below = 300 - 150 - 8 = 142, room above = 150 - 8 = 142
    expect(place(150, 150, 300)).toEqual({
      side: LocationMenuSide.BELOW,
      maxHeightPx: 142,
    });
  });
});
