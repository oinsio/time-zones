// Verifies FR1, FR6, UX1 of show-utc-offset-on-location-rows (D5).
// Verifies FR1, FR2, FR4, UX1, UX2, UX3, NFR-A1 of match-here-mark-to-design.
// Verifies FR1, FR2, UX1, UX2 of mark-device-time-zone-in-location-list (D5).
import { screen } from "@testing-library/react";
import i18n from "i18next";
import { LocationMarkKind } from "@/presenter";
import { renderKolkataRow as renderRow } from "./locationRowFixture";

describe("LocationRow here mark", () => {
  beforeEach(async () => {
    await i18n.changeLanguage("en");
  });

  const hereMark = {
    kind: LocationMarkKind.HERE,
    accessibleLabel: "You are here",
    caption: "here",
  };

  it("should put the mark image before the city on the city line", () => {
    renderRow({ mark: hereMark });
    const cityLine = screen.getByText("Kolkata").parentElement;
    expect(cityLine?.firstElementChild).toBe(
      screen.getByRole("img", { name: "You are here" }),
    );
    expect(cityLine?.firstElementChild?.nextElementSibling).toBe(
      screen.getByText("Kolkata"),
    );
  });

  it("should put the caption right after the city", () => {
    renderRow({ mark: hereMark });
    expect(screen.getByText("Kolkata").nextElementSibling).toBe(
      screen.getByText("here"),
    );
  });

  it("should hide the caption from assistive technology", () => {
    renderRow({ mark: hereMark });
    expect(screen.getByText("here")).toHaveAttribute("aria-hidden", "true");
  });

  it("should draw the caption as bold accent text", () => {
    renderRow({ mark: hereMark });
    expect(screen.getByText("here")).toHaveClass("text-accent", "font-bold");
  });

  it.each(["bg-accent", "rounded-full", "border"])(
    "should not draw the caption as a pill with the %s class",
    (pillClassName) => {
      renderRow({ mark: hereMark });
      expect(screen.getByText("here")).not.toHaveClass(pillClassName);
    },
  );

  it("should name the row by the city and the mark", () => {
    renderRow({ mark: hereMark });
    expect(
      screen.getByRole("listitem", { name: "Kolkata You are here" }),
    ).toBeInTheDocument();
  });

  it("should name the row by the city alone without a mark", () => {
    renderRow();
    expect(
      screen.getByRole("listitem", { name: "Kolkata" }),
    ).toBeInTheDocument();
  });

  it("should start the city line with the city and render nothing else on it without a mark", () => {
    renderRow();
    expect(screen.getByText("Kolkata").parentElement?.children).toHaveLength(1);
  });

  it("should not show the former pill text", () => {
    renderRow({ mark: hereMark });
    expect(screen.queryByText("Your time zone")).toBeNull();
  });
});
