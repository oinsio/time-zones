// Verifies FR1, FR2, FR7 of add-time-sliders-to-location-cards (D7).
import { fireEvent, render } from "@testing-library/react";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { DayPeriod, type PresentedDayTrack } from "@/presenter";
import { DayTrack } from "./DayTrack";
import { buildDayTrackGradient } from "./dayTrackGradient";

const ALMATY_LABELS = ["00", "06", "12", "18", "00"];
const ALMATY_TRACK: PresentedDayTrack = {
  fraction: 0.520833,
  valueMinutes: 750,
  maxMinutes: 1425,
  valueText: "12:30, Sun, Mar 8",
  stops: [
    { fraction: 0.270833, period: DayPeriod.NIGHT },
    { fraction: 0.3125, period: DayPeriod.MORNING },
    { fraction: 0.380208, period: DayPeriod.WORK },
  ],
  hourLabels: ALMATY_LABELS.map((label, labelIndex) => ({
    fraction: labelIndex / (ALMATY_LABELS.length - 1),
    label,
  })),
};

const renderTrack = () =>
  render(
    <DayTrack
      track={ALMATY_TRACK}
      city="Almaty"
      onSelectFraction={vi.fn()}
      onMoveTrack={vi.fn()}
    />,
  );

describe("DayTrack", () => {
  it("should paint the bar with the gradient of the stops", () => {
    const { container } = renderTrack();

    const bar = container.querySelector<HTMLElement>("[data-day-track-bar]");
    expect(bar?.style.backgroundImage).toBe(
      buildDayTrackGradient(ALMATY_TRACK.stops),
    );
  });

  it("should place the handle at the fraction of the moment", () => {
    const { container } = renderTrack();

    const handle = container.querySelector<HTMLElement>(
      "[data-day-track-handle]",
    );
    expect(handle?.style.left).toBe("52.0833%");
  });

  it("should list five hour labels in a hidden container", () => {
    const { container } = renderTrack();

    const labels = container.querySelectorAll("[data-hour-label]");
    expect([...labels].map((label) => label.textContent)).toEqual(
      ALMATY_LABELS,
    );
    expect(labels[0]?.parentElement?.getAttribute("aria-hidden")).toBe("true");
  });
});

/** jsdom has no PointerEvent; React reads `pointerType` and `pointerId` from it. */
class FakePointerEvent extends MouseEvent {
  pointerId: number;
  pointerType: string;
  constructor(type: string, init: PointerEventInit = {}) {
    super(type, init);
    this.pointerId = init.pointerId ?? 0;
    this.pointerType = init.pointerType ?? "";
  }
}
beforeAll(() => {
  vi.stubGlobal("PointerEvent", FakePointerEvent);
});
afterAll(() => {
  vi.unstubAllGlobals();
});
// Verifies FR3, FR4 of add-time-sliders-to-location-cards (D7).
describe("DayTrack input", () => {
  const TRACK_WIDTH = 400;
  const setup = () => {
    const onSelectFraction = vi.fn();
    const onMoveTrack = vi.fn();
    const { getByRole } = render(
      <DayTrack
        track={ALMATY_TRACK}
        city="Almaty"
        onSelectFraction={onSelectFraction}
        onMoveTrack={onMoveTrack}
      />,
    );
    const slider = getByRole("slider");
    slider.getBoundingClientRect = () =>
      ({ left: 0, width: TRACK_WIDTH }) as DOMRect;
    slider.setPointerCapture = vi.fn();
    slider.releasePointerCapture = vi.fn();
    slider.hasPointerCapture = () => true;
    return { slider, onSelectFraction, onMoveTrack };
  };
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
