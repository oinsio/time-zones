// Verifies FR3, FR4 of add-time-sliders-to-location-cards (D7).
import { fireEvent } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import {
  setupInteractiveTrack as setup,
  TRACK_WIDTH,
  useFakePointerEvents,
} from "./dayTrackFixture";

describe("DayTrack input", () => {
  useFakePointerEvents();
  const pointer = (
    pointerType: string,
    clientX: number,
    clientY = 0,
    pointerId = 1,
  ) => ({ pointerType, clientX, clientY, pointerId });

  it("should select the pressed position for a mouse", () => {
    const { slider, onSelectFraction } = setup();

    fireEvent.pointerDown(slider, pointer("mouse", 300));

    expect(onSelectFraction).toHaveBeenCalledWith(0.75);
  });

  it("should follow a mouse drag and clamp it to the track", () => {
    const { slider, onSelectFraction } = setup();
    fireEvent.pointerDown(slider, pointer("mouse", 100));

    fireEvent.pointerMove(slider, pointer("mouse", 900));

    expect(onSelectFraction).toHaveBeenLastCalledWith(1);
  });

  it("should select nothing for a touch that has not moved yet", () => {
    const { slider, onSelectFraction } = setup();

    fireEvent.pointerDown(slider, pointer("touch", 300));

    expect(onSelectFraction).not.toHaveBeenCalled();
  });

  it("should select at the lift of a tap", () => {
    const { slider, onSelectFraction } = setup();
    fireEvent.pointerDown(slider, pointer("touch", 300));

    fireEvent.pointerUp(slider, pointer("touch", 300));

    expect(onSelectFraction).toHaveBeenCalledWith(0.75);
  });

  it("should select while a finger drags along the track", () => {
    const { slider, onSelectFraction } = setup();
    fireEvent.pointerDown(slider, pointer("touch", 100));

    fireEvent.pointerMove(slider, pointer("touch", 200));

    expect(onSelectFraction).toHaveBeenLastCalledWith(0.5);
  });

  it("should select nothing for a vertical swipe", () => {
    const { slider, onSelectFraction } = setup();
    fireEvent.pointerDown(slider, pointer("touch", 100, 0));

    fireEvent.pointerMove(slider, pointer("touch", 102, 30));
    fireEvent.pointerUp(slider, pointer("touch", 102, 30));

    expect(onSelectFraction).not.toHaveBeenCalled();
  });

  it("should select nothing when the browser cancels the touch", () => {
    const { slider, onSelectFraction } = setup();
    fireEvent.pointerDown(slider, pointer("touch", 100));

    fireEvent.pointerCancel(slider, pointer("touch", 100));
    fireEvent.pointerUp(slider, pointer("touch", 100));

    expect(onSelectFraction).not.toHaveBeenCalled();
  });

  it("should measure the position from the left edge of the track", () => {
    const { slider, onSelectFraction } = setup();
    slider.getBoundingClientRect = () =>
      ({ left: 100, width: TRACK_WIDTH }) as DOMRect;

    fireEvent.pointerDown(slider, pointer("mouse", 300));

    expect(onSelectFraction).toHaveBeenCalledWith(0.5);
  });

  it("should select nothing on a track without width", () => {
    const { slider, onSelectFraction } = setup();
    slider.getBoundingClientRect = () => ({ left: 0, width: 0 }) as DOMRect;

    fireEvent.pointerDown(slider, pointer("mouse", 300));

    expect(onSelectFraction).not.toHaveBeenCalled();
  });

  it("should capture the pointer on a mouse press and release it at the end", () => {
    const { slider } = setup();

    fireEvent.pointerDown(slider, pointer("mouse", 300));
    fireEvent.pointerUp(slider, pointer("mouse", 300));

    expect(slider.setPointerCapture).toHaveBeenCalledWith(1);
    expect(slider.releasePointerCapture).toHaveBeenCalledWith(1);
  });

  it("should not release a pointer it does not hold", () => {
    const { slider } = setup();
    slider.hasPointerCapture = () => false;

    fireEvent.pointerUp(slider, pointer("mouse", 300));

    expect(slider.releasePointerCapture).not.toHaveBeenCalled();
  });

  it("should ignore a hover without a press", () => {
    const { slider, onSelectFraction } = setup();
    slider.hasPointerCapture = () => false;

    fireEvent.pointerMove(slider, pointer("mouse", 300));

    expect(onSelectFraction).not.toHaveBeenCalled();
  });

  it("should ignore a second finger while the first one decides", () => {
    const { slider, onSelectFraction } = setup();
    slider.hasPointerCapture = () => false;
    fireEvent.pointerDown(slider, pointer("touch", 100, 0, 1));

    fireEvent.pointerMove(slider, pointer("touch", 300, 0, 2));

    expect(onSelectFraction).not.toHaveBeenCalled();
  });

  it("should capture the touch only once it drags along the track", () => {
    const { slider } = setup();
    fireEvent.pointerDown(slider, pointer("touch", 100));
    expect(slider.setPointerCapture).not.toHaveBeenCalled();

    fireEvent.pointerMove(slider, pointer("touch", 200));

    expect(slider.setPointerCapture).toHaveBeenCalledWith(1);
  });

  it("should stay abandoned after a vertical swipe", () => {
    const { slider, onSelectFraction } = setup();
    fireEvent.pointerDown(slider, pointer("touch", 100, 0));
    fireEvent.pointerMove(slider, pointer("touch", 102, 30));

    fireEvent.pointerMove(slider, pointer("touch", 300, 30));

    expect(onSelectFraction).not.toHaveBeenCalled();
    expect(slider.setPointerCapture).not.toHaveBeenCalled();
  });

  it("should select once on the lift of a drag, not again", () => {
    const { slider, onSelectFraction } = setup();
    fireEvent.pointerDown(slider, pointer("touch", 100));
    fireEvent.pointerMove(slider, pointer("touch", 200));
    onSelectFraction.mockClear();

    fireEvent.pointerUp(slider, pointer("touch", 200));

    expect(onSelectFraction).not.toHaveBeenCalled();
  });

  it("should move by a mapped key without scrolling the page", () => {
    const { slider, onMoveTrack } = setup();

    const isNotPrevented = fireEvent.keyDown(slider, { key: "PageUp" });

    expect(onMoveTrack).toHaveBeenCalledWith("HOUR_FORWARD");
    expect(isNotPrevented).toBe(false);
  });

  it("should ignore an unmapped key", () => {
    const { slider, onMoveTrack } = setup();

    const isNotPrevented = fireEvent.keyDown(slider, { key: "Tab" });

    expect(onMoveTrack).not.toHaveBeenCalled();
    expect(isNotPrevented).toBe(true);
  });
});
