// Verifies FR1, NFR-A1, NFR-A2 of add-gnomish-factory-credit (D1).
// Verifies FR1, NFR-A1, UX1 of move-and-restyle-gnomish-factory-credit (D1).
import { render, screen, within } from "@testing-library/react";
import i18n from "i18next";
import { createInMemoryPreferencesRepository } from "@/adapters";
import { PreferencesProvider } from "@/controller";
import { PreferencesLoadStatus } from "@/ports";
import { createManualWriteScheduler } from "@/test/writeSchedulers";
import { SettingsPage } from "./SettingsPage";

const renderPage = (repository = createInMemoryPreferencesRepository()) =>
  render(
    <PreferencesProvider
      repository={repository}
      writeScheduler={createManualWriteScheduler()}
    >
      <SettingsPage notices={null} onBack={vi.fn()} />
    </PreferencesProvider>,
  );

const getCredit = () =>
  screen.getByRole("link", { name: "Built with Gnomish Factory" });

const expectThemeGroupRightAfter = (credit: HTMLElement) =>
  expect(
    within(credit.nextElementSibling as HTMLElement).getByRole("radiogroup", {
      name: "Theme",
    }),
  ).toBeInTheDocument();

describe("SettingsPage Gnomish Factory credit", () => {
  beforeEach(async () => {
    await i18n.changeLanguage("en");
  });
  afterEach(async () => {
    await i18n.changeLanguage("ru");
  });

  it("should not show the credit in the header", () => {
    renderPage();
    expect(within(screen.getByRole("banner")).queryByRole("link")).toBeNull();
  });

  it("should show the credit directly above the theme group", () => {
    renderPage();
    const credit = getCredit();
    expect(screen.getByRole("main")).toContainElement(credit);
    expectThemeGroupRightAfter(credit);
  });

  it("should show the unreadable note above the credit", async () => {
    renderPage(
      createInMemoryPreferencesRepository({
        initialDocument: { status: PreferencesLoadStatus.UNREADABLE },
      }),
    );
    const note = await screen.findByRole("alert");
    const credit = getCredit();
    expect(
      note.compareDocumentPosition(credit) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    expectThemeGroupRightAfter(credit);
  });

  it("should keep the focus on the heading with the credit shown", () => {
    renderPage();
    expect(screen.getByRole("heading", { name: "Settings" })).toHaveFocus();
    expect(getCredit()).not.toHaveFocus();
  });
});
