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
  caption: "here",
};

const homeMark: PresentedLocationMark = {
  kind: LocationMarkKind.HOME,
  accessibleLabel: "Home location",
  caption: "",
};

describe("LocationMarkIcon", () => {
  it("should draw the home mark as an outlined house in the accent color", () => {
    render(<LocationMarkIcon mark={homeMark} id="mark-id" />);

    const wrapper = screen.getByRole("img", { name: "Home location" });
    const icon = wrapper.querySelector("svg");
    expect(wrapper).toHaveClass("text-accent");
    expect(icon).toHaveAttribute("aria-hidden", "true");
    expect(icon).toHaveClass("lucide-home-mark-house");
    expect(icon).toHaveAttribute("fill", "none");
    expect(icon).toHaveAttribute("stroke", "currentColor");
    expect(icon).toHaveAttribute("stroke-width", "2");
    expect(icon).toHaveAttribute("stroke-linejoin", "round");
    expect(icon).toHaveAttribute("viewBox", "0 0 24 24");
    expect(icon).toHaveAttribute("width", String(LOCATION_MARK_ICON_SIZE_PX));
    expect(icon).toHaveAttribute("height", String(LOCATION_MARK_ICON_SIZE_PX));
    const paths = icon?.querySelectorAll("path") ?? [];
    expect(paths).toHaveLength(1);
    expect(paths[0]).toHaveAttribute("d", "M4 11l8-7 8 7v9H4z");
    expect(
      icon?.querySelectorAll("circle, rect, line, polyline, polygon, ellipse"),
    ).toHaveLength(0);
  });

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
