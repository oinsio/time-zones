// Verifies FR1, FR2, FR7 of add-time-sliders-to-location-cards (D7).
import { describe, expect, it } from "vitest";
import { ALMATY_LABELS, ALMATY_TRACK, renderTrack } from "./dayTrackFixture";
import { buildDayTrackGradient } from "./dayTrackGradient";

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

  // Verifies FR13 of redesign-cards-grid-and-day-palettes: bar 12 px, handle 23 px in the card colour.
  it("should draw a 12 px bar on every width", () => {
    const { container } = renderTrack();

    const bar = container.querySelector<HTMLElement>("[data-day-track-bar]");
    expect(bar?.className).toContain("h-3");
    expect(bar?.className).not.toContain("md:");
  });

  it("should not inset the track on wide screens", () => {
    const { container } = renderTrack();

    const inset = container.querySelector<HTMLElement>(
      "[data-day-track-inset]",
    );
    expect(inset?.className).not.toContain("md:inset-x");
  });

  it("should draw the visible handle at the handle size with the surface fill and handle border", () => {
    const { container } = renderTrack();

    const visibleHandle = container.querySelector<HTMLElement>(
      "[data-day-track-handle] > span",
    );
    expect(visibleHandle?.className).toContain("h-handle w-handle");
    expect(visibleHandle?.className).toContain("bg-surface");
    expect(visibleHandle?.className).toContain("border-handle-border");
    expect(visibleHandle?.className).toContain(
      "border-[length:var(--handle-border-width)]",
    );
  });
});
