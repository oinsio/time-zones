// Verifies FR9, NFR-A2 of add-main-page-scaffold: warning without focus steal.
import { render, screen } from "@testing-library/react";
import i18n from "i18next";
import { StorageWarning } from "./StorageWarning";

describe("StorageWarning", () => {
  it.each([
    {
      language: "en",
      text: "Storage is unavailable, so your changes will not be saved.",
    },
    {
      language: "ru",
      text: "Хранилище недоступно, поэтому изменения не будут сохранены.",
    },
  ])(
    "should say in $language that changes will not be saved",
    async ({ language, text }) => {
      await i18n.changeLanguage(language);
      render(<StorageWarning />);
      expect(screen.getByText(text)).toBeInTheDocument();
    },
  );

  it("should take no focus and offer no control", async () => {
    await i18n.changeLanguage("en");
    render(<StorageWarning />);
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
    expect(document.body).toHaveFocus();
  });
});
