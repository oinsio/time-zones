// Verifies FR8, NFR-A2 of add-main-page-scaffold: a short, non-blocking note.
import { render, screen } from "@testing-library/react";
import i18n from "i18next";
import { UpdateCheckFailedNote } from "./UpdateCheckFailedNote";

describe("UpdateCheckFailedNote", () => {
  it.each([
    {
      language: "en",
      text: "The latest version could not be fetched. The app keeps working.",
    },
    {
      language: "ru",
      text: "Не удалось получить последнюю версию. Приложение продолжает работать.",
    },
  ])(
    "should say in $language that the latest version could not be fetched",
    async ({ language, text }) => {
      await i18n.changeLanguage(language);
      render(<UpdateCheckFailedNote />);
      expect(screen.getByText(text)).toBeInTheDocument();
    },
  );

  it("should take no focus and offer no control", async () => {
    await i18n.changeLanguage("en");
    render(<UpdateCheckFailedNote />);
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
    expect(document.body).toHaveFocus();
  });
});
