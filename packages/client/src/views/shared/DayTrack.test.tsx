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
});
