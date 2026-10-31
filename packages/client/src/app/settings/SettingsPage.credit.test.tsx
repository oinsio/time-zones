// Verifies FR1, NFR-A1, NFR-A2 of add-gnomish-factory-credit (D1).
import { render, screen } from "@testing-library/react";
import i18n from "i18next";
import { createInMemoryPreferencesRepository } from "@/adapters";
import { PreferencesProvider } from "@/controller";
import { createManualWriteScheduler } from "@/test/writeSchedulers";
import { SettingsPage } from "./SettingsPage";

const renderPage = () =>
  render(
    <PreferencesProvider
      repository={createInMemoryPreferencesRepository()}
      writeScheduler={createManualWriteScheduler()}
    >
      <SettingsPage notices={null} onBack={vi.fn()} />
    </PreferencesProvider>,
  );

describe("SettingsPage Gnomish Factory credit", () => {
  beforeEach(async () => {
    await i18n.changeLanguage("en");
  });
  afterEach(async () => {
    await i18n.changeLanguage("ru");
  });

  it("should show the Gnomish Factory credit as the first element of the header", () => {
    renderPage();
    const header = screen.getByRole("banner");
    const firstFocusable = header.querySelector("a, button");
    const credit = screen.getByRole("link", {
      name: "Built with Gnomish Factory",
    });
    const backButton = screen.getByRole("button", { name: "Back" });
    expect(firstFocusable).toBe(credit);
    expect(
      credit.compareDocumentPosition(backButton) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
  });

  it("should keep the focus on the heading with the credit shown", () => {
    renderPage();
    expect(screen.getByRole("heading", { name: "Settings" })).toHaveFocus();
    expect(
      screen.getByRole("link", { name: "Built with Gnomish Factory" }),
    ).not.toHaveFocus();
  });
});
