// Verifies FR6, FR7, UX2 of setup-app-shell-and-pages-deploy: the shell shows
// service worker notices in the polite region and wires their actions.

import { useRegisterSW } from "virtual:pwa-register/react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import i18n from "i18next";
import { AppShell } from "./AppShell";

vi.mock("virtual:pwa-register/react", () => ({ useRegisterSW: vi.fn() }));

type RegisterSwState = ReturnType<typeof useRegisterSW>;

const mockServiceWorker = ({
  isOfflineReady = false,
  isUpdateAvailable = false,
} = {}) => {
  const setOfflineReady = vi.fn();
  const setNeedRefresh = vi.fn();
  const updateServiceWorker = vi.fn().mockResolvedValue(undefined);
  vi.mocked(useRegisterSW).mockReturnValue({
    offlineReady: [isOfflineReady, setOfflineReady],
    needRefresh: [isUpdateAvailable, setNeedRefresh],
    updateServiceWorker,
  } as RegisterSwState);
  return { setOfflineReady, setNeedRefresh, updateServiceWorker };
};

describe("AppShell notices", () => {
  beforeEach(async () => {
    await i18n.changeLanguage("en");
  });

  it("should announce the offline-ready notice politely", () => {
    mockServiceWorker({ isOfflineReady: true });
    render(<AppShell />);
    expect(screen.getByRole("status")).toHaveTextContent(
      "The app is ready to work offline.",
    );
  });

  it("should announce the update notice politely", () => {
    mockServiceWorker({ isUpdateAvailable: true });
    render(<AppShell />);
    expect(screen.getByRole("status")).toHaveTextContent(
      "A new version is available.",
    );
  });

  it("should use a polite live region for notices", () => {
    mockServiceWorker({ isUpdateAvailable: true });
    render(<AppShell />);
    expect(screen.getByRole("status")).toHaveAttribute("aria-live", "polite");
  });

  it("should keep notices outside main so they do not replace page content", () => {
    mockServiceWorker({ isUpdateAvailable: true });
    render(<AppShell />);
    expect(screen.getByRole("main")).not.toContainElement(
      screen.getByRole("status"),
    );
  });

  it("should show no notice when nothing happened", () => {
    mockServiceWorker();
    render(<AppShell />);
    expect(screen.getByRole("status")).toBeEmptyDOMElement();
  });

  it("should reload into the new version from the update notice", async () => {
    const { updateServiceWorker } = mockServiceWorker({
      isUpdateAvailable: true,
    });
    render(<AppShell />);
    await userEvent.click(screen.getByRole("button", { name: "Reload" }));
    expect(updateServiceWorker).toHaveBeenCalledWith(true);
  });

  it("should clear the offline-ready state when its notice is dismissed", async () => {
    const { setOfflineReady } = mockServiceWorker({ isOfflineReady: true });
    render(<AppShell />);
    await userEvent.click(screen.getByRole("button", { name: "Dismiss" }));
    expect(setOfflineReady).toHaveBeenCalledWith(false);
  });

  it("should clear the update state when its notice is dismissed", async () => {
    const { setNeedRefresh } = mockServiceWorker({ isUpdateAvailable: true });
    render(<AppShell />);
    await userEvent.click(screen.getByRole("button", { name: "Dismiss" }));
    expect(setNeedRefresh).toHaveBeenCalledWith(false);
  });
});
