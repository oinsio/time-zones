// Verifies FR1, FR2, FR3, NFR-A1, UX2 of make-location-menu-button-vertical: the vertical dots button.
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { LOCATION_MENU_ICON_SIZE_PX } from "@/constants";
import { LocationMenu } from "./LocationMenu";

function renderTrigger() {
  render(<LocationMenu city="Moscow" items={[]} />);
  return screen.getByRole("button", { name: "Действия: Moscow" });
}

describe("LocationMenu trigger", () => {
  it("should hold no text", () => {
    expect(renderTrigger().textContent).toBe("");
  });

  it("should hold one hidden icon of the icon size", () => {
    const icons = renderTrigger().querySelectorAll("svg");

    expect(icons).toHaveLength(1);
    expect(icons[0]).toHaveAttribute("aria-hidden", "true");
    expect(icons[0]).toHaveAttribute(
      "width",
      String(LOCATION_MENU_ICON_SIZE_PX),
    );
    expect(icons[0]).toHaveAttribute(
      "height",
      String(LOCATION_MENU_ICON_SIZE_PX),
    );
  });

  it("should stack three dots one above the other", () => {
    const dots = Array.from(renderTrigger().querySelectorAll("circle"));

    expect(dots).toHaveLength(3);
    expect(new Set(dots.map((dot) => dot.getAttribute("cx"))).size).toBe(1);
    expect(new Set(dots.map((dot) => dot.getAttribute("cy"))).size).toBe(3);
  });

  it("should draw the icon in the current colour so the locked button dims it", () => {
    expect(renderTrigger().querySelector("svg")).toHaveAttribute(
      "stroke",
      "currentColor",
    );
  });

  it("should keep the 44 px hit area", () => {
    const trigger = renderTrigger();

    expect(trigger).toHaveClass("min-h-11", "min-w-11");
  });

  it("should reach into the row padding with a negative right margin", () => {
    expect(renderTrigger().parentElement).toHaveClass("-mr-3");
  });
});
