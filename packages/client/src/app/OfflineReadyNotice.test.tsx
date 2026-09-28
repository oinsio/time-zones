// Verifies FR6, NFR-A2 of setup-app-shell-and-pages-deploy: dismissible
// offline-ready notice that never takes focus.
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import i18n from "i18next";
import { OfflineReadyNotice } from "./OfflineReadyNotice";

describe("OfflineReadyNotice", () => {
  beforeEach(async () => {
    await i18n.changeLanguage("en");
  });

  it("should tell the user that the app works offline", () => {
    render(<OfflineReadyNotice onDismiss={vi.fn()} />);
    expect(
      screen.getByText("The app is ready to work offline."),
    ).toBeInTheDocument();
  });

  it("should call onDismiss when the dismiss control is used", async () => {
    const onDismiss = vi.fn();
    render(<OfflineReadyNotice onDismiss={onDismiss} />);
    await userEvent.click(screen.getByRole("button", { name: "Dismiss" }));
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it("should call onDismiss when Escape is pressed", async () => {
    const onDismiss = vi.fn();
    render(<OfflineReadyNotice onDismiss={onDismiss} />);
    await userEvent.keyboard("{Escape}");
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it("should not take focus when shown", () => {
    render(<OfflineReadyNotice onDismiss={vi.fn()} />);
    expect(document.activeElement).toBe(document.body);
  });
});
