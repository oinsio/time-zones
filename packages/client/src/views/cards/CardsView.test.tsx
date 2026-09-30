// Verifies FR7, UX1 of add-main-page-scaffold: the empty state of Cards.
import { render, screen } from "@testing-library/react";
import i18n from "i18next";
import CardsView from "./CardsView";

describe("CardsView", () => {
  it.each([
    { language: "en", explanation: "No locations added yet." },
    { language: "ru", explanation: "Локации пока не добавлены." },
  ])(
    "should explain in $language that no locations are added",
    async ({ language, explanation }) => {
      await i18n.changeLanguage(language);
      render(<CardsView />);
      expect(screen.getByText(explanation)).toBeInTheDocument();
    },
  );

  it("should offer no action while there is nothing to act on", async () => {
    await i18n.changeLanguage("en");
    render(<CardsView />);
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });
});
