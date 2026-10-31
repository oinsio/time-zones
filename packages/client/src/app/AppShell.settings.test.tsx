// Verifies FR1, FR2, FR3, FR4, FR5, FR7 of add-settings-page-and-device-time-location (D5, D7, D10, D11).
import { useRegisterSW } from "virtual:pwa-register/react";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import i18n from "i18next";
import { STORAGE_KEYS } from "@/constants";
import { stubZoneCitiesFetch } from "@/test/stubZoneCitiesFetch";
import { AppShell } from "./AppShell";

vi.mock("virtual:pwa-register/react", () => ({ useRegisterSW: vi.fn() }));

const mockServiceWorker = (isUpdateAvailable = false) => {
  vi.mocked(useRegisterSW).mockReturnValue({
    offlineReady: [false, vi.fn()],
    needRefresh: [isUpdateAvailable, vi.fn()],
    updateServiceWorker: vi.fn(),
  } as ReturnType<typeof useRegisterSW>);
};

const openSettings = () =>
  userEvent.click(screen.getByRole("button", { name: "Settings" }));

describe("AppShell settings page", () => {
  beforeEach(async () => {
    await i18n.changeLanguage("en");
    mockServiceWorker();
    stubZoneCitiesFetch();
    localStorage.clear();
  });
  afterEach(async () => {
    await i18n.changeLanguage("ru");
    delete document.documentElement.dataset.theme;
    vi.unstubAllGlobals();
  });

  it("should open the page with the settings button and focus its heading", async () => {
    render(<AppShell />);
    await openSettings();
    expect(
      await screen.findByRole("heading", { name: "Settings" }),
    ).toHaveFocus();
  });

  it("should show no date bar and no Add location button on the settings page", async () => {
    render(<AppShell />);
    await openSettings();
    expect(
      screen.queryByRole("group", { name: "Date" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Add location" }),
    ).not.toBeInTheDocument();
  });

  it("should return with Back and focus the settings button", async () => {
    render(<AppShell />);
    await openSettings();
    await userEvent.click(screen.getByRole("button", { name: "Back" }));
    expect(screen.getByRole("button", { name: "Settings" })).toHaveFocus();
    expect(screen.getByRole("group", { name: "Date" })).toBeInTheDocument();
  });

  it("should return with Esc and focus the settings button", async () => {
    render(<AppShell />);
    await openSettings();
    await userEvent.keyboard("{Escape}");
    expect(screen.getByRole("button", { name: "Settings" })).toHaveFocus();
  });

  it("should not focus the settings button on the first render", () => {
    render(<AppShell />);
    expect(screen.getByRole("button", { name: "Settings" })).not.toHaveFocus();
  });

  it("should stay on the settings page for keys other than Esc", async () => {
    render(<AppShell />);
    await openSettings();
    await userEvent.keyboard("a");
    expect(
      screen.getByRole("heading", { name: "Settings" }),
    ).toBeInTheDocument();
  });

  it("should keep the pinned reference moment across the visit", async () => {
    render(<AppShell />);
    await userEvent.click(screen.getByRole("button", { name: "Next day" }));
    const chooseDateButton = () =>
      screen.getByRole("button", { name: /^Choose date/ });
    const shownDate = chooseDateButton().textContent;
    await openSettings();
    await userEvent.click(screen.getByRole("button", { name: "Back" }));
    expect(chooseDateButton().textContent).toBe(shownDate);
    expect(screen.getByRole("button", { name: "Now" })).toBeEnabled();
  });

  it("should not open the search with the slash key on the settings page", async () => {
    render(<AppShell />);
    await openSettings();
    await userEvent.keyboard("/");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("should open the search with the slash key on the main page", async () => {
    render(<AppShell />);
    await userEvent.keyboard("/");
    expect(await screen.findByRole("dialog")).toBeInTheDocument();
  });

  it("should hide the Add location button while the stored list is unreadable", () => {
    localStorage.setItem(STORAGE_KEYS.LOCATIONS, "{not json");
    render(<AppShell />);
    expect(
      screen.queryByRole("button", { name: "Add location" }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Settings" }),
    ).toBeInTheDocument();
  });

  it("should apply the chosen theme to the document at once", async () => {
    render(<AppShell />);
    await openSettings();
    await userEvent.click(screen.getByRole("radio", { name: "Dark" }));
    expect(document.documentElement.dataset.theme).toBe("dark");
    await userEvent.click(screen.getByRole("radio", { name: "System" }));
    expect(document.documentElement.dataset.theme).toBeUndefined();
  });

  it("should apply a stored theme in the first render", () => {
    localStorage.setItem(
      STORAGE_KEYS.PREFERENCES,
      JSON.stringify({
        schemaVersion: 1,
        payload: { theme: "DARK", hourFormat: "H24" },
      }),
    );
    render(<AppShell />);
    expect(document.documentElement.dataset.theme).toBe("dark");
  });

  it("should show the times of the main page in the chosen hour format", async () => {
    render(<AppShell />);
    await openSettings();
    await userEvent.click(screen.getByRole("radio", { name: "12-hour" }));
    await userEvent.click(screen.getByRole("button", { name: "Back" }));
    const deviceTimeItem = await screen.findByRole("listitem");
    await waitFor(() =>
      expect(
        within(deviceTimeItem).getAllByText(/\b(AM|PM)\b/).length,
      ).toBeGreaterThan(0),
    );
  });

  // FR3: notices on the settings page
  it("should hold the update notice in a polite status region of the settings page", async () => {
    mockServiceWorker(true);
    render(<AppShell />);
    await openSettings();
    expect(screen.getByRole("status")).toHaveTextContent(
      "A new version is available.",
    );
  });
});
