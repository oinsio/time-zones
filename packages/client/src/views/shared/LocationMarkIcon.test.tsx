// Verifies FR4, UX1, M3 of match-here-mark-to-design: the leading mark icon.
// Verifies FR1, FR2, FR3, FR4, NFR-A1, UX2 of match-home-mark-to-design
// Verifies FR7 of set-home-location-and-show-differences: the home mark icon.
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { LOCATION_MARK_ICON_SIZE_PX } from "@/constants";
import { LocationMarkKind, type PresentedLocationMark } from "@/presenter";
import { LOCATION_MARK_ICONS, LocationMarkIcon } from "./LocationMarkIcon";

const hereMark: PresentedLocationMark = {
  kind: LocationMarkKind.HERE,
  accessibleLabel: "You are here",
};

const homeMark: PresentedLocationMark = {
  kind: LocationMarkKind.HOME,
  accessibleLabel: "Home location",
};

describe("LocationMarkIcon", () => {
  it.each([
    ["home", homeMark, "Home location", "lucide-house"],
    ["here", hereMark, "You are here", "lucide-map-pin"],
  ])(
    "should draw the %s mark as an outlined Lucide icon in the accent color",
    (_kind, mark, name, iconClass) => {
      render(<LocationMarkIcon mark={mark} id="mark-id" />);

      const wrapper = screen.getByRole("img", { name });
      const icon = wrapper.querySelector("svg");
      expect(wrapper).toHaveClass("text-accent");
      expect(icon).toHaveClass(iconClass);
      expect(icon).toHaveAttribute("aria-hidden", "true");
      expect(icon).toHaveAttribute("fill", "none");
      expect(icon).toHaveAttribute("stroke", "currentColor");
      expect(icon).toHaveAttribute("width", String(LOCATION_MARK_ICON_SIZE_PX));
      expect(icon).toHaveAttribute(
        "height",
        String(LOCATION_MARK_ICON_SIZE_PX),
      );
    },
  );

  it("should give the wrapper the id", () => {
    render(<LocationMarkIcon mark={hereMark} id="mark-id" />);

    expect(screen.getByRole("img", { name: "You are here" })).toHaveAttribute(
      "id",
      "mark-id",
    );
  });

  it("should have an icon for every mark kind", () => {
    expect(Object.keys(LOCATION_MARK_ICONS).sort()).toEqual(
      Object.values(LocationMarkKind).sort(),
    );
  });
});
