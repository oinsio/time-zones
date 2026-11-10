// Verifies FR10, FR11 of add-grid-meeting-range-and-share (D6): the edge zone and the frame loop of the auto-scroll.
import { fireEvent, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  installPanelGeometry,
  PANEL_RIGHT_PX,
  renderHandle,
} from "./meetingHandleFixture";

const EDGE_ZONE_PX = 32;
const frameQueue: FrameRequestCallback[] = [];
const runFrame = () => frameQueue.shift()?.(0);

function setup(scrollLeftPx = 100) {
  const geometry = installPanelGeometry();
  const rendered = renderHandle({ isScrollable: true });
  geometry.bindScrollLeft(rendered.panel);
  rendered.panel.scrollLeft = scrollLeftPx;
  return { ...geometry, slider: screen.getByRole("slider") };
}

const pointer = (clientX: number) => ({ pointerType: "mouse", clientX });

describe("useMeetingHandleDrag edge zone", () => {
  beforeEach(() => {
    frameQueue.length = 0;
    vi.stubGlobal("requestAnimationFrame", (frame: FrameRequestCallback) => {
      frameQueue.push(frame);
      return frameQueue.length;
    });
    vi.stubGlobal("cancelAnimationFrame", () => {
      frameQueue.length = 0;
    });
  });
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it.each([
    [
      "on the inner border of the right zone",
      PANEL_RIGHT_PX - EDGE_ZONE_PX,
      108,
    ],
    ["on the inner border of the left zone", EDGE_ZONE_PX, 92],
  ])("should scroll %s", (_label, clientX, expectedScrollLeft) => {
    const { slider, getScrollLeft } = setup();
    fireEvent.pointerDown(slider, pointer(200));
    fireEvent.pointerMove(slider, pointer(clientX));

    runFrame();

    expect(getScrollLeft()).toBe(expectedScrollLeft);
  });

  it.each([
    ["just inside the right zone's border", PANEL_RIGHT_PX - EDGE_ZONE_PX - 1],
    ["just inside the left zone's border", EDGE_ZONE_PX + 1],
  ])("should not scroll %s", (_label, clientX) => {
    const { slider, getScrollLeft } = setup();
    fireEvent.pointerDown(slider, pointer(200));
    fireEvent.pointerMove(slider, pointer(clientX));

    runFrame();

    expect(getScrollLeft()).toBe(100);
  });

  it("should ask for one frame while the pointer stays in the zone", () => {
    const { slider } = setup();
    fireEvent.pointerDown(slider, pointer(200));
    fireEvent.pointerMove(slider, pointer(380));
    fireEvent.pointerMove(slider, pointer(385));

    expect(frameQueue).toHaveLength(1);
  });

  it("should keep scrolling frame after frame", () => {
    const { slider, getScrollLeft } = setup();
    fireEvent.pointerDown(slider, pointer(200));
    fireEvent.pointerMove(slider, pointer(380));

    runFrame();
    runFrame();
    runFrame();

    expect(getScrollLeft()).toBe(124);
  });

  it("should not scroll in a frame that runs after the drag ended", () => {
    const { slider, getScrollLeft } = setup();
    fireEvent.pointerDown(slider, pointer(200));
    fireEvent.pointerMove(slider, pointer(380));
    const pendingFrame = frameQueue[0];
    fireEvent.pointerUp(slider, pointer(380));

    pendingFrame(0);

    expect(getScrollLeft()).toBe(100);
  });
});
