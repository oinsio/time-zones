// Verifies FR10, FR11, UX2 of add-grid-meeting-range-and-share (D6).
import { fireEvent, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { MeetingHandle } from "@/model";
import {
  installPanelGeometry,
  MAX_SCROLL_LEFT_PX,
  renderHandle,
} from "./meetingHandleFixture";

const frameQueue: FrameRequestCallback[] = [];
const runFrame = () => {
  const frame = frameQueue.shift();
  frame?.(0);
};

function setup(isScrollable: boolean, scrollLeftPx = 0) {
  const geometry = installPanelGeometry();
  const rendered = renderHandle({ isScrollable });
  geometry.bindScrollLeft(rendered.panel);
  rendered.panel.scrollLeft = scrollLeftPx;
  const slider = screen.getByRole("slider");
  return { ...rendered, ...geometry, slider };
}

const pointer = (clientX: number) => ({ pointerType: "mouse", clientX });

describe("useMeetingHandleDrag with pointer events", () => {
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

  it("should give the minutes under the pointer", () => {
    const { slider, onDragHandleTo } = setup(false);

    fireEvent.pointerDown(slider, pointer(100));
    fireEvent.pointerMove(slider, pointer(256));

    expect(onDragHandleTo).toHaveBeenLastCalledWith(MeetingHandle.END, 360);
  });

  it("should not shift the minutes by the scroll again", () => {
    const { slider, onDragHandleTo } = setup(true, 300);

    fireEvent.pointerDown(slider, pointer(100));
    fireEvent.pointerMove(slider, pointer(100));

    expect(onDragHandleTo).toHaveBeenLastCalledWith(MeetingHandle.END, 576);
  });

  it("should do nothing on a move without a press", () => {
    const { slider, onDragHandleTo } = setup(false);

    fireEvent.pointerMove(slider, pointer(256));

    expect(onDragHandleTo).not.toHaveBeenCalled();
  });

  it("should stop after the pointer is released", () => {
    const { slider, onDragHandleTo } = setup(false);
    fireEvent.pointerDown(slider, pointer(100));
    fireEvent.pointerUp(slider, pointer(100));

    fireEvent.pointerMove(slider, pointer(256));

    expect(onDragHandleTo).not.toHaveBeenCalled();
  });

  it("should stop after the gesture is cancelled", () => {
    const { slider, onDragHandleTo } = setup(false);
    fireEvent.pointerDown(slider, pointer(100));
    fireEvent.pointerCancel(slider, pointer(100));

    fireEvent.pointerMove(slider, pointer(256));

    expect(onDragHandleTo).not.toHaveBeenCalled();
  });

  it("should scroll 8 px per frame within 32 px of the right edge", () => {
    const { slider, getScrollLeft } = setup(true);
    fireEvent.pointerDown(slider, pointer(100));
    fireEvent.pointerMove(slider, pointer(380));

    runFrame();
    runFrame();

    expect(getScrollLeft()).toBe(16);
  });

  it("should scroll back within 32 px of the left edge", () => {
    const { slider, getScrollLeft } = setup(true, 100);
    fireEvent.pointerDown(slider, pointer(200));
    fireEvent.pointerMove(slider, pointer(20));

    runFrame();

    expect(getScrollLeft()).toBe(92);
  });

  it("should read the strip's rect again after each scroll frame", () => {
    const { slider, onDragHandleTo } = setup(true);
    fireEvent.pointerDown(slider, pointer(100));
    fireEvent.pointerMove(slider, pointer(380));

    runFrame();

    expect(onDragHandleTo).toHaveBeenLastCalledWith(
      MeetingHandle.END,
      ((380 - (16 - 8)) / 40) * 60,
    );
  });

  it("should not scroll when the strips do not scroll", () => {
    const { slider, getScrollLeft } = setup(false);
    fireEvent.pointerDown(slider, pointer(100));
    fireEvent.pointerMove(slider, pointer(380));

    runFrame();

    expect(getScrollLeft()).toBe(0);
    expect(frameQueue).toHaveLength(0);
  });

  it("should not scroll in the middle of the panel", () => {
    const { slider, getScrollLeft } = setup(true);
    fireEvent.pointerDown(slider, pointer(100));
    fireEvent.pointerMove(slider, pointer(200));

    runFrame();

    expect(getScrollLeft()).toBe(0);
  });

  it("should stop scrolling on pointer up", () => {
    const { slider, getScrollLeft } = setup(true);
    fireEvent.pointerDown(slider, pointer(100));
    fireEvent.pointerMove(slider, pointer(380));
    runFrame();

    fireEvent.pointerUp(slider, pointer(380));
    runFrame();

    expect(getScrollLeft()).toBe(8);
  });

  it("should stop when the pointer leaves the zone", () => {
    const { slider, getScrollLeft } = setup(true);
    fireEvent.pointerDown(slider, pointer(100));
    fireEvent.pointerMove(slider, pointer(380));
    fireEvent.pointerMove(slider, pointer(200));

    runFrame();

    expect(getScrollLeft()).toBe(0);
  });

  it("should stop at the end of the scroll", () => {
    const { slider, getScrollLeft } = setup(true, MAX_SCROLL_LEFT_PX);
    fireEvent.pointerDown(slider, pointer(100));
    fireEvent.pointerMove(slider, pointer(380));

    runFrame();

    expect(getScrollLeft()).toBe(MAX_SCROLL_LEFT_PX);
    expect(frameQueue).toHaveLength(0);
  });

  it("should capture the pointer", () => {
    const { slider } = setup(false);
    slider.setPointerCapture = vi.fn();

    fireEvent.pointerDown(slider, { ...pointer(100), pointerId: 7 });

    expect(slider.setPointerCapture).toHaveBeenCalledWith(7);
  });
});

describe("useMeetingHandleDrag without Pointer Events", () => {
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

  it("should drag by finger and keep the browser from scrolling", async () => {
    const { slider, onDragHandleTo } = await setupTouch();
    fireEvent.touchStart(slider, touch(100));

    const allowsScroll = fireEvent.touchMove(slider, touch(256));

    expect(onDragHandleTo).toHaveBeenLastCalledWith(MeetingHandle.END, 360);
    expect(allowsScroll).toBe(false);
  });

  it("should stop when the finger lifts", async () => {
    const { slider, onDragHandleTo } = await setupTouch();
    fireEvent.touchStart(slider, touch(100));
    fireEvent.touchEnd(slider, touch(100));

    fireEvent.touchMove(slider, touch(256));

    expect(onDragHandleTo).not.toHaveBeenCalled();
  });

  it("should ignore a move without a touch start", async () => {
    const { slider, onDragHandleTo } = await setupTouch();

    fireEvent.touchMove(slider, touch(256));

    expect(onDragHandleTo).not.toHaveBeenCalled();
  });
});
