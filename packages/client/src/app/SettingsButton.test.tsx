// Verifies FR1, UX1 of add-settings-page-and-device-time-location (D11).
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import i18n from "i18next";
import { SettingsButton } from "./SettingsButton";

describe("SettingsButton", () => {
  beforeEach(async () => {
    await i18n.changeLanguage("en");
  });

  it("should be named Settings and draw the sliders icon", () => {
    render(<SettingsButton onClick={vi.fn()} />);
    const button = screen.getByRole("button", { name: "Settings" });
    expect(
      button.querySelector("svg.lucide-sliders-horizontal"),
    ).not.toBeNull();
  });

  it("should emit clicks", async () => {
    const onClick = vi.fn();
    render(<SettingsButton onClick={onClick} />);
    await userEvent.click(screen.getByRole("button", { name: "Settings" }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("should be named Настройки in Russian", async () => {
    await i18n.changeLanguage("ru");
    render(<SettingsButton onClick={vi.fn()} />);
    expect(
      screen.getByRole("button", { name: "Настройки" }),
    ).toBeInTheDocument();
  });
});
