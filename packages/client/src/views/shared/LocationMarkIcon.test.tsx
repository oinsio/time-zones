// Verifies FR4, UX1, M3 of match-here-mark-to-design: the leading mark icon.
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { LOCATION_MARK_ICON_SIZE_PX } from "@/constants";
import { LocationMarkKind, type PresentedLocationMark } from "@/presenter";
import { LOCATION_MARK_ICONS, LocationMarkIcon } from "./LocationMarkIcon";

const hereMark: PresentedLocationMark = {
  kind: LocationMarkKind.HERE,
  accessibleLabel: "You are here",
  caption: "here",
};

describe("LocationMarkIcon", () => {
  it("should name the wrapper by the accessible label and give it the id", () => {
    render(<LocationMarkIcon mark={hereMark} id="mark-id" />);

    const wrapper = screen.getByRole("img", { name: "You are here" });
    expect(wrapper).toHaveAttribute("id", "mark-id");
    expect(wrapper).toHaveClass("text-accent");
  });

  it("should hide the drawn icon, size it and fill it with the text color", () => {
    render(<LocationMarkIcon mark={hereMark} id="mark-id" />);

    const icon = screen.getByRole("img").querySelector("svg");
    expect(icon).toHaveAttribute("aria-hidden", "true");
    expect(icon).toHaveAttribute("width", String(LOCATION_MARK_ICON_SIZE_PX));
    expect(icon).toHaveAttribute("fill", "currentColor");
  });

  it.each(Object.values(LocationMarkKind))(
    "should have an icon that renders an svg for the %s kind",
    (kind) => {
      expect(LOCATION_MARK_ICONS[kind]).toBeDefined();

      render(<LocationMarkIcon mark={{ ...hereMark, kind }} id="mark-id" />);

      expect(screen.getByRole("img").querySelector("svg")).not.toBeNull();
    },
  );
});
