// Verifies FR1, FR6, UX1 of show-utc-offset-on-location-rows (D5).
// Verifies FR1, FR2, FR4, UX1, UX2, UX3, NFR-A1 of match-here-mark-to-design.
// Verifies FR1, FR2, UX1, UX2 of mark-device-time-zone-in-location-list (D5).
// Verifies FR10 of redesign-cards-grid-and-day-palettes: the Here mark has no visible caption.
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

  it("should show no visible caption after the city", () => {
    renderRow({ mark: hereMark });
    expect(screen.queryByText("here")).toBeNull();
  });

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

  it("should start the place with the city and render no mark without one", () => {
    renderRow();
    expect(screen.getByText("Kolkata").parentElement?.firstElementChild).toBe(
      screen.getByText("Kolkata"),
    );
    expect(screen.queryByRole("img")).toBeNull();
  });

  it("should not show the former pill text", () => {
    renderRow({ mark: hereMark });
    expect(screen.queryByText("Your time zone")).toBeNull();
  });
});
