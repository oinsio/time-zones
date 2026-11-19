// Verifies FR5, UX2 of redesign-cards-grid-and-day-palettes.
import { render } from "@testing-library/react";
import { DayPalette } from "@/preferences";
import { PaletteSwatch } from "./PaletteSwatch";

const PERIODS = ["night", "morning", "daylight", "evening"];

describe("PaletteSwatch", () => {
  it.each([
    [DayPalette.VIVID, "vivid"],
    [DayPalette.MUTED, "muted"],
  ])(
    "should draw four stripes of the %s palette, night to evening",
    (dayPalette, name) => {
      const { container } = render(<PaletteSwatch dayPalette={dayPalette} />);

      const stripes = Array.from(container.querySelectorAll("span > span"));
      expect(stripes.map((stripe) => stripe.className)).toEqual(
        PERIODS.map((period) =>
          expect.stringContaining(`var(--color-day-${name}-${period})`),
        ),
      );
    },
  );

  it("should be 24 px with a surface outline", () => {
    const { container } = render(
      <PaletteSwatch dayPalette={DayPalette.VIVID} />,
    );

    expect(container.firstElementChild?.className).toContain("outline-surface");
  });
});
