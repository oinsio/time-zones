// Verifies FR7, FR8 of polish-settings-and-remove-offline-update-notice.
// Verifies FR8, FR9, NFR-A2 of add-main-page-scaffold: the page notices stack
// next to the service worker notices in the polite region, and FR13 of
// add-locations-via-search: a failed save shows the storage warning.

import { useRegisterSW } from "virtual:pwa-register/react";
import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import i18n from "i18next";
import { STORAGE_KEYS } from "@/constants";
import { stubZoneCitiesFetch } from "@/test/stubZoneCitiesFetch";
import { AppShell } from "./AppShell";

vi.mock("virtual:pwa-register/react", () => ({ useRegisterSW: vi.fn() }));

const STORAGE_WARNING_TEXT =
  "Storage is unavailable, so your changes will not be saved.";

type RegisterSwState = ReturnType<typeof useRegisterSW>;
type RegisterOptions = NonNullable<Parameters<typeof useRegisterSW>[0]>;

const mockServiceWorker = (isUpdateAvailable = false) => {
  vi.mocked(useRegisterSW).mockReturnValue({
    offlineReady: [false, vi.fn()],
    needRefresh: [isUpdateAvailable, vi.fn()],
    updateServiceWorker: vi.fn(),
  } as RegisterSwState);
};

const failUpdateCheck = async () => {
  const { onRegisteredSW } = vi.mocked(useRegisterSW).mock
    .calls[0][0] as RegisterOptions;
  const registration = {
    update: () => Promise.reject(new TypeError("network unreachable")),
  } as unknown as ServiceWorkerRegistration;
  await act(async () => {
    onRegisteredSW?.("sw.js", registration);
  });
};

// The notices region is the status region of the footer; the header search
// and the hosted view have their own announcement regions.
const getNoticesRegion = () => {
  const region = screen
    .getAllByRole("status")
    .find((candidate) => candidate.closest("footer") !== null);
  if (region === undefined) throw new Error("no notices region");
  return region;
};

describe("AppShell page notices", () => {
  beforeEach(async () => {
    await i18n.changeLanguage("en");
    mockServiceWorker();
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should show nothing in the notices region after a failed check", async () => {
    render(<AppShell />);
    await failUpdateCheck();
    expect(getNoticesRegion()).toBeEmptyDOMElement();
  });

  it("should keep the update notice alone after a failed check", async () => {
    mockServiceWorker(true);
    render(<AppShell />);
    await failUpdateCheck();
    expect(getNoticesRegion()).toHaveTextContent("A new version is available.");
    expect(getNoticesRegion()).not.toHaveTextContent("could not be fetched");
  });

  it("should show nothing when the browser goes offline and back online", () => {
    render(<AppShell />);
    act(() => {
      window.dispatchEvent(new Event("offline"));
    });
    expect(getNoticesRegion()).toBeEmptyDOMElement();
    act(() => {
      window.dispatchEvent(new Event("online"));
    });
    expect(getNoticesRegion()).toBeEmptyDOMElement();
  });

  it("should show no storage warning when storage works", () => {
    render(<AppShell />);
    expect(screen.queryByText(STORAGE_WARNING_TEXT)).not.toBeInTheDocument();
  });

  it("should warn when writing to storage fails and keep the view", async () => {
    vi.spyOn(localStorage, "setItem").mockImplementation(() => {
      throw new DOMException("quota", "QuotaExceededError");
    });
    render(<AppShell />);
    expect(getNoticesRegion()).toHaveTextContent(STORAGE_WARNING_TEXT);
    expect(await screen.findByRole("list")).toBeInTheDocument();
  });

  it("should warn when only saving the list fails, after a location is added", async () => {
    stubZoneCitiesFetch();
    const realSetItem = localStorage.setItem.bind(localStorage);
    vi.spyOn(localStorage, "setItem").mockImplementation((key, value) => {
      if (key === STORAGE_KEYS.LOCATIONS) {
        throw new DOMException("quota", "QuotaExceededError");
      }
      realSetItem(key, value);
    });
    render(<AppShell />);
    expect(screen.queryByText(STORAGE_WARNING_TEXT)).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Add location" }));
    await userEvent.type(await screen.findByRole("combobox"), "Moscow");
    await userEvent.click(screen.getByRole("option", { name: /Moscow/ }));
    expect(await screen.findByText(STORAGE_WARNING_TEXT)).toBeInTheDocument();
    vi.unstubAllGlobals();
  });
});
