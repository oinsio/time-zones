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

describe("useMeetingHandleDrag frame cancelling", () => {
  beforeEach(() => {
    frameQueue.length = 0;
    vi.stubGlobal("requestAnimationFrame", (frame: FrameRequestCallback) => {
      frameQueue.push(frame);
      return 7;
    });
  });
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it("should cancel the pending frame when the drag ends", () => {
    const cancelAnimationFrame = vi.fn();
    vi.stubGlobal("cancelAnimationFrame", cancelAnimationFrame);
    const { slider } = setup();
    fireEvent.pointerDown(slider, pointer(200));
    fireEvent.pointerMove(slider, pointer(380));

    fireEvent.pointerUp(slider, pointer(380));
    fireEvent.pointerUp(slider, pointer(380));

    expect(cancelAnimationFrame).toHaveBeenCalledExactlyOnceWith(7);
  });

  it("should cancel no frame when none is pending", () => {
    const cancelAnimationFrame = vi.fn();
    vi.stubGlobal("cancelAnimationFrame", cancelAnimationFrame);
    const { slider } = setup();
    fireEvent.pointerDown(slider, pointer(200));
    fireEvent.pointerMove(slider, pointer(210));

    fireEvent.pointerUp(slider, pointer(210));

    expect(cancelAnimationFrame).not.toHaveBeenCalled();
  });
});

describe("useMeetingHandleDrag touch details", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
    vi.resetModules();
  });

  async function setupTouch() {
    vi.stubGlobal("PointerEvent", undefined);
    vi.resetModules();
    const fixture = await import("./meetingHandleFixture");
    const geometry = fixture.installPanelGeometry();
    const rendered = fixture.renderHandle();
    geometry.bindScrollLeft(rendered.panel);
    return { ...rendered, slider: screen.getByRole("slider") };
  }
  const touch = (clientX: number) => ({
    changedTouches: [{ identifier: 1, clientX, clientY: 0 }],
  });

  it("should leave a move the browser cannot cancel alone", async () => {
    const { slider } = await setupTouch();
    fireEvent.touchStart(slider, touch(100));

    const isNotPrevented = fireEvent.touchMove(slider, {
      ...touch(256),
      cancelable: false,
    });

    expect(isNotPrevented).toBe(true);
  });

  it("should stop when the touch is cancelled", async () => {
    const { slider, onDragHandleTo } = await setupTouch();
    fireEvent.touchStart(slider, touch(100));
    fireEvent.touchCancel(slider, touch(100));

    fireEvent.touchMove(slider, touch(256));

    expect(onDragHandleTo).not.toHaveBeenCalled();
  });
});
