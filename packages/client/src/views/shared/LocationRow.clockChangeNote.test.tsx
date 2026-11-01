// Verifies NFR-A1, UX1 of show-clock-change-note-on-location-cards (D6).
import { screen } from "@testing-library/react";
import i18n from "i18next";
import { renderKolkataRow as renderRow } from "./locationRowFixture";

const NOTE = "On Oct 25 at 03:00 clocks will go back 1 h";

describe("LocationRow clock change note", () => {
  beforeEach(async () => {
    await i18n.changeLanguage("en");
  });

  it("should render the note as the card's last element, after the location menu button", () => {
    renderRow({ clockChangeNote: NOTE });

    const card = screen.getByRole("listitem");
    const note = screen.getByText(NOTE).closest("p");
    const menuButton = screen.getByRole("button", {
      name: "Actions for Kolkata",
    });
    expect(card.lastElementChild).toBe(note);
    expect(
      menuButton.compareDocumentPosition(note as Node) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
  });

  it("should keep the note out of the row's accessible name", () => {
    renderRow({ clockChangeNote: NOTE });

    expect(
      screen.getByRole("listitem", { name: "Kolkata" }),
    ).toBeInTheDocument();
  });

  it("should render no note without clockChangeNote", () => {
    renderRow();

    expect(screen.queryByText(NOTE)).not.toBeInTheDocument();
  });
});
