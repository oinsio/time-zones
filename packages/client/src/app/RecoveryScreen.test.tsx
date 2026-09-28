// Verifies FR8, UX4 of setup-app-shell-and-pages-deploy: plain-language
// recovery screen with a reload action.
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import i18n from "i18next";
import { RecoveryScreen } from "./RecoveryScreen";

describe("RecoveryScreen", () => {
  beforeEach(async () => {
    await i18n.changeLanguage("en");
  });

  it("should name the problem in a heading", () => {
    render(<RecoveryScreen onReload={vi.fn()} />);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      "Something went wrong",
    );
  });

  it("should explain what to do in plain language", () => {
    render(<RecoveryScreen onReload={vi.fn()} />);
    expect(
      screen.getByText(
        "The app ran into a problem. Reload the page to continue.",
      ),
    ).toBeInTheDocument();
  });

  it("should call onReload when the reload action is used", async () => {
    const onReload = vi.fn();
    render(<RecoveryScreen onReload={onReload} />);
    await userEvent.click(screen.getByRole("button", { name: "Reload" }));
    expect(onReload).toHaveBeenCalledTimes(1);
  });
});
