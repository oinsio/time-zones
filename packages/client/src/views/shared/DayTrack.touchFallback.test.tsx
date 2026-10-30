// Verifies FR4, UX3 of fix-day-track-drag-continuity-and-smoothness.
import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ALMATY_TRACK, TRACK_WIDTH } from "./dayTrackFixture";
import { formatPercent } from "./dayTrackGradient";

const SETTLED_LEFT = formatPercent(ALMATY_TRACK.fraction);

async function renderTrack(hasPointerEvents: boolean) {
  if (!hasPointerEvents) vi.stubGlobal("PointerEvent", undefined);
  vi.resetModules();
  const { DayTrack } = await import("./DayTrack");
  const onSelectFraction = vi.fn();
  render(
    <DayTrack
      track={ALMATY_TRACK}
      city="Almaty"
      onSelectFraction={onSelectFraction}
      onMoveTrack={vi.fn()}
    />,
  );
  const slider = screen.getByRole("slider");
  const bar = slider.querySelector<HTMLElement>(
    "[data-day-track-bar]",
  ) as HTMLElement;
  bar.getBoundingClientRect = () =>
    ({ left: 0, width: TRACK_WIDTH }) as DOMRect;
  const handle = slider.querySelector<HTMLElement>(
    "[data-day-track-handle]",
  ) as HTMLElement;
  return { slider, handle, onSelectFraction };
}

const touch = (clientX: number, clientY = 0, identifier = 1) => ({
  changedTouches: [{ identifier, clientX, clientY }],
});

describe("DayTrack finger drag without Pointer Events", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.resetModules();
  });

  it("should keep selecting when the finger leaves the bar vertically", async () => {
    const { slider, onSelectFraction } = await renderTrack(false);
    fireEvent.touchStart(slider, touch(100));

    const firstMoveAllowsScroll = fireEvent.touchMove(slider, touch(120));
    const secondMoveAllowsScroll = fireEvent.touchMove(slider, touch(300, 500));

    expect(onSelectFraction).toHaveBeenLastCalledWith(0.75);
    expect(firstMoveAllowsScroll).toBe(false);
    expect(secondMoveAllowsScroll).toBe(false);
  });

  it("should leave a mostly vertical move to the browser", async () => {
    const { slider, onSelectFraction } = await renderTrack(false);
    fireEvent.touchStart(slider, touch(100));

    const allowsScroll = fireEvent.touchMove(slider, touch(102, 30));

    expect(onSelectFraction).not.toHaveBeenCalled();
    expect(allowsScroll).toBe(true);
  });

  it.each(["touchEnd", "touchCancel"] as const)(
    "should move the handle with the finger and settle it after %s",
    async (endEvent) => {
      const { slider, handle, onSelectFraction } = await renderTrack(false);
      fireEvent.touchStart(slider, touch(100));
      fireEvent.touchMove(slider, touch(204.8));
      expect(handle.style.left).toBe("51.2%");
      onSelectFraction.mockClear();

      fireEvent[endEvent](slider, touch(204.8));

      expect(handle.style.left).toBe(SETTLED_LEFT);
      expect(onSelectFraction).not.toHaveBeenCalled();
    },
  );

  it("should ignore the click that follows a drag", async () => {
    const { slider, onSelectFraction } = await renderTrack(false);
    fireEvent.touchStart(slider, touch(100));
    fireEvent.touchMove(slider, touch(200));
    fireEvent.touchEnd(slider, touch(200));
    onSelectFraction.mockClear();

    fireEvent.click(slider, { clientX: 300 });

    expect(onSelectFraction).not.toHaveBeenCalled();
  });

  it("should still select a tap through the click", async () => {
    const { slider, onSelectFraction } = await renderTrack(false);
    fireEvent.touchStart(slider, touch(300));
    fireEvent.touchEnd(slider, touch(300));

    fireEvent.click(slider, { clientX: 300 });

    expect(onSelectFraction).toHaveBeenCalledTimes(1);
    expect(onSelectFraction).toHaveBeenCalledWith(0.75);
  });

  it("should ignore a second finger", async () => {
    const { slider, onSelectFraction } = await renderTrack(false);
    fireEvent.touchStart(slider, touch(100, 0, 1));
    fireEvent.touchMove(slider, touch(200, 0, 1));
    onSelectFraction.mockClear();

    fireEvent.touchStart(slider, touch(50, 0, 2));
    fireEvent.touchMove(slider, touch(380, 0, 2));

    expect(onSelectFraction).not.toHaveBeenCalled();
  });

  it("should select nothing from touch events where Pointer Events exist", async () => {
    const { slider, onSelectFraction } = await renderTrack(true);
    fireEvent.touchStart(slider, touch(100));
    fireEvent.touchMove(slider, touch(300));

    expect(onSelectFraction).not.toHaveBeenCalled();
  });
});
