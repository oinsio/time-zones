// Verifies FR7, FR8 of refine-meeting-range-entry-and-handles (D5, D8): the grab offset and the release of a handle drag.
import { fireEvent, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { MEETING_HANDLE_RELEASE_CLICK_WINDOW_MS } from "@/constants";
import { installPanelGeometry, renderHandle } from "./meetingHandleFixture";

const pointer = (clientX: number) => ({ pointerType: "mouse", clientX });
const touch = (clientX: number) => ({
  changedTouches: [{ identifier: 1, clientX, clientY: 0 }],
});

function setup() {
  const geometry = installPanelGeometry();
  const rendered = renderHandle();
  geometry.bindScrollLeft(rendered.panel);
  const outside = document.createElement("button");
  const onOutsideClick = vi.fn();
  outside.addEventListener("click", onOutsideClick);
  document.body.append(outside);
  return {
    ...rendered,
    outside,
    onOutsideClick,
    slider: screen.getByRole("slider"),
  };
}

describe("useMeetingHandleDrag release", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
    vi.resetModules();
    document.body.querySelectorAll(":scope > button").forEach((button) => {
      button.remove();
    });
  });

  it("should not move the handle on a press and release without a move", () => {
    const { slider, onDragHandleTo } = setup();

    fireEvent.pointerDown(slider, pointer(100));
    fireEvent.pointerUp(slider, pointer(100));

    expect(onDragHandleTo).not.toHaveBeenCalled();
  });

  it("should report the drag as active from the press to the release", () => {
    const { slider, onDragActiveChange } = setup();

    fireEvent.pointerDown(slider, pointer(100));
    expect(onDragActiveChange).toHaveBeenLastCalledWith(true);
    fireEvent.pointerUp(slider, pointer(100));

    expect(onDragActiveChange).toHaveBeenLastCalledWith(false);
  });

  it("should report the drag as inactive when the gesture is cancelled", () => {
    const { slider, onDragActiveChange } = setup();

    fireEvent.pointerDown(slider, pointer(100));
    fireEvent.pointerCancel(slider, pointer(100));

    expect(onDragActiveChange).toHaveBeenLastCalledWith(false);
  });

  it("should stop the click that ends a drag before it reaches another element", () => {
    const { slider, outside, onOutsideClick } = setup();
    fireEvent.pointerDown(slider, pointer(100));
    fireEvent.pointerMove(slider, pointer(256));
    fireEvent.pointerUp(slider, pointer(256));

    const isNotPrevented = fireEvent.click(outside);

    expect(onOutsideClick).not.toHaveBeenCalled();
    expect(isNotPrevented).toBe(false);
  });

  it("should stop only one click", () => {
    const { slider, outside, onOutsideClick } = setup();
    fireEvent.pointerDown(slider, pointer(100));
    fireEvent.pointerUp(slider, pointer(100));
    fireEvent.click(outside);

    fireEvent.click(outside);

    expect(onOutsideClick).toHaveBeenCalledTimes(1);
  });

  it("should let a click through once the release window has passed", () => {
    const setTimeoutSpy = vi.spyOn(window, "setTimeout");
    const { slider, outside, onOutsideClick } = setup();
    fireEvent.pointerDown(slider, pointer(100));
    fireEvent.pointerUp(slider, pointer(100));
    const [expireGuard, windowMs] = setTimeoutSpy.mock.calls.at(-1) ?? [];

    expect(windowMs).toBe(MEETING_HANDLE_RELEASE_CLICK_WINDOW_MS);
    (expireGuard as () => void)();
    fireEvent.click(outside);

    expect(onOutsideClick).toHaveBeenCalledTimes(1);
  });

  it("should not stop a click after a cancelled gesture", () => {
    const { slider, outside, onOutsideClick } = setup();
    fireEvent.pointerDown(slider, pointer(100));
    fireEvent.pointerCancel(slider, pointer(100));

    fireEvent.click(outside);

    expect(onOutsideClick).toHaveBeenCalledTimes(1);
  });
});

describe("useMeetingHandleDrag release without Pointer Events", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
    vi.resetModules();
    document.body.querySelectorAll(":scope > button").forEach((button) => {
      button.remove();
    });
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

  it("should keep the browser from synthesizing a click at touchend", async () => {
    const { slider } = await setupTouch();
    fireEvent.touchStart(slider, touch(100));
    fireEvent.touchMove(slider, touch(256));

    const isNotPrevented = fireEvent.touchEnd(slider, touch(256));

    expect(isNotPrevented).toBe(false);
  });

  it("should report the finger drag as active until the finger lifts", async () => {
    const { slider, onDragActiveChange } = await setupTouch();

    fireEvent.touchStart(slider, touch(100));
    expect(onDragActiveChange).toHaveBeenLastCalledWith(true);
    fireEvent.touchEnd(slider, touch(100));

    expect(onDragActiveChange).toHaveBeenLastCalledWith(false);
  });
});
