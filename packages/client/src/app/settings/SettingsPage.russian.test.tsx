// Verifies FR1, FR2 of compact-settings-controls.
import { screen, within } from "@testing-library/react";
import i18n from "i18next";
import { renderSettingsPage } from "./renderSettingsPage";

describe("SettingsPage in Russian", () => {
  afterEach(async () => {
    await i18n.changeLanguage("ru");
  });

  it("should write the texts in Russian", async () => {
    await i18n.changeLanguage("ru");
    renderSettingsPage();
    expect(
      screen.getByRole("heading", { name: "Настройки" }),
    ).toBeInTheDocument();
    const russianTheme = screen.getByRole("radiogroup", { name: "Тема" });
    expect(
      within(russianTheme)
        .getAllByRole("radio")
        .map((radio) => radio.closest("label")?.getAttribute("title")),
    ).toEqual(["Системная", "Светлая", "Тёмная"]);
    const russianHours = screen.getByRole("radiogroup", {
      name: "Формат времени",
    });
    expect(
      within(russianHours)
        .getAllByRole("radio")
        .map((radio) => radio.closest("label")?.getAttribute("title")),
    ).toEqual(["12 часов", "24 часа"]);
  });
});
