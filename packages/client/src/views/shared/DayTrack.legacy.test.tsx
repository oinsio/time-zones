// Verifies FR4 of fix-day-track-handle-overlap-and-end-of-day.
// FR8, NFR-A2, UX1 of support-legacy-ios-12-safari: tap selection without Pointer Events.
import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { KeyboardKey } from "@/constants";
import {
  ALMATY_TRACK,
  setupInteractiveTrack,
  TRACK_WIDTH,
} from "./dayTrackFixture";

const TAP_X = (TRACK_WIDTH * 3) / 4;

async function renderLegacyTrack() {
  vi.stubGlobal("PointerEvent", undefined);
  vi.resetModules();
  const { DayTrack } = await import("./DayTrack");
  const onSelectFraction = vi.fn();
  const onMoveTrack = vi.fn();
  render(
    <DayTrack
      track={ALMATY_TRACK}
      city="Almaty"
      onSelectFraction={onSelectFraction}
      onMoveTrack={onMoveTrack}
    />,
  );
  const slider = screen.getByRole("slider");
  const bar = slider.querySelector<HTMLElement>(
    "[data-day-track-bar]",
  ) as HTMLElement;
  bar.getBoundingClientRect = () =>
    ({ left: 0, width: TRACK_WIDTH }) as DOMRect;
  return { slider, bar, onSelectFraction, onMoveTrack };
}

describe("DayTrack without Pointer Events", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.resetModules();
  });

  it("should select the tapped position on click", async () => {
    const { slider, onSelectFraction } = await renderLegacyTrack();

    fireEvent.click(slider, { clientX: TAP_X });

    expect(onSelectFraction).toHaveBeenCalledWith(0.75);
  });

  it("should clamp a click past the end of the track", async () => {
    const { slider, onSelectFraction } = await renderLegacyTrack();

    fireEvent.click(slider, { clientX: TRACK_WIDTH * 2 });

    expect(onSelectFraction).toHaveBeenCalledWith(1);
  });

  it("should keep the role, name, value and keys of the slider", async () => {
    const { slider, onMoveTrack } = await renderLegacyTrack();

    expect(slider).toHaveAttribute(
      "aria-label",
      expect.stringContaining("Almaty"),
    );
    expect(slider).toHaveAttribute("aria-valuenow", "750");
    expect(slider).toHaveAttribute("aria-valuetext", "12:30, Sun, Mar 8");
    fireEvent.keyDown(slider, { key: KeyboardKey.ARROW_RIGHT });
    expect(onMoveTrack).toHaveBeenCalledTimes(1);
  });
});

describe("DayTrack with Pointer Events", () => {
  it("should select nothing on a click without a press", () => {
    const { slider, onSelectFraction } = setupInteractiveTrack();

    fireEvent.click(slider, { clientX: TAP_X });

    expect(onSelectFraction).not.toHaveBeenCalled();
  });
});
