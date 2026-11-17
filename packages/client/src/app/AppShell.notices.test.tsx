// Verifies FR6, FR7, UX2 of setup-app-shell-and-pages-deploy: the shell shows
// service worker notices in the polite region and wires their actions.

import { useRegisterSW } from "virtual:pwa-register/react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import i18n from "i18next";
import { createAnotherAppRevisionSource } from "@/test/anotherAppRevisionSource";
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

/** The notices region; a drag and drop live region is also a status once the list loads. */
const getNoticesRegion = () =>
  screen
    .getAllByRole("status")
    .find(
      (region) => region.getAttribute("aria-live") === "polite",
    ) as HTMLElement;

describe("AppShell notices", () => {
  beforeEach(async () => {
    await i18n.changeLanguage("en");
  });

  it("should announce the offline-ready notice politely", () => {
    mockServiceWorker({ isOfflineReady: true });
    render(<AppShell />);
    expect(getNoticesRegion()).toHaveTextContent(
      "The app is ready to work offline.",
    );
  });

  it("should announce the update notice politely", async () => {
    mockServiceWorker({ isUpdateAvailable: true });
    render(<AppShell appRevisionSource={createAnotherAppRevisionSource()} />);
    await screen.findByRole("button", { name: "Reload" });
    expect(getNoticesRegion()).toHaveTextContent("A new version is available.");
  });

  it("should use a polite live region for notices", () => {
    mockServiceWorker({ isUpdateAvailable: true });
    render(<AppShell appRevisionSource={createAnotherAppRevisionSource()} />);
    expect(getNoticesRegion()).toHaveAttribute("aria-live", "polite");
  });

  it("should keep notices outside main so they do not replace page content", () => {
    mockServiceWorker({ isUpdateAvailable: true });
    render(<AppShell appRevisionSource={createAnotherAppRevisionSource()} />);
    expect(screen.getByRole("main")).not.toContainElement(getNoticesRegion());
  });

  it("should show no notice when nothing happened", () => {
    mockServiceWorker();
    render(<AppShell />);
    expect(getNoticesRegion()).toBeEmptyDOMElement();
  });

  it("should reload into the new version from the update notice", async () => {
    const { updateServiceWorker } = mockServiceWorker({
      isUpdateAvailable: true,
    });
    render(<AppShell appRevisionSource={createAnotherAppRevisionSource()} />);
    await userEvent.click(
      await screen.findByRole("button", { name: "Reload" }),
    );
    expect(updateServiceWorker).toHaveBeenCalledWith(true);
  });

  it("should clear the offline-ready state when its notice is dismissed", async () => {
    const { setOfflineReady } = mockServiceWorker({ isOfflineReady: true });
    render(<AppShell />);
    await userEvent.click(screen.getByRole("button", { name: "Dismiss" }));
    expect(setOfflineReady).toHaveBeenCalledWith(false);
  });

  it("should hide the update notice when it is dismissed, the build staying waiting", async () => {
    const { setNeedRefresh } = mockServiceWorker({ isUpdateAvailable: true });
    render(<AppShell appRevisionSource={createAnotherAppRevisionSource()} />);
    await userEvent.click(
      await screen.findByRole("button", { name: "Dismiss" }),
    );
    expect(screen.queryByRole("button", { name: "Reload" })).toBeNull();
    expect(setNeedRefresh).not.toHaveBeenCalled();
  });
});
