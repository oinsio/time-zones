// Verifies FR3, FR4, FR11 of apply-data-updates-silently: the notices region follows the update status.
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import i18n from "i18next";
import type { PwaUpdateStatus, ZoneRulesUpdate } from "@/controller";
import { MeetingShareNotice } from "@/controller";
import { AppShellNotices } from "./AppShellNotices";

const READY_RELEASE = "2026g";

const createUpdateStatus = (
  overrides: Partial<PwaUpdateStatus> = {},
): PwaUpdateStatus => ({
  isOfflineReady: false,
  isBuildWaiting: false,
  isUpdateAvailable: false,
  applyUpdate: vi.fn().mockResolvedValue(undefined),
  dismiss: vi.fn(),
  ...overrides,
});

const renderNotices = ({
  updateStatus = createUpdateStatus(),
  readyRelease = undefined as string | undefined,
  hasStorageWarning = false,
  shareNotice = undefined as MeetingShareNotice | undefined,
} = {}) => {
  const reloadPage = vi.fn();
  render(
    <AppShellNotices
      updateStatus={updateStatus}
      zoneRulesUpdate={{ readyRelease, dismiss: vi.fn() } as ZoneRulesUpdate}
      reloadPage={reloadPage}
      hasStorageWarning={hasStorageWarning}
      shareNotice={shareNotice}
      onDismissShareNotice={vi.fn()}
    />,
  );
  return { reloadPage, updateStatus };
};

describe("AppShellNotices", () => {
  beforeEach(async () => {
    await i18n.changeLanguage("en");
  });

  it("should show nothing when nothing happened", () => {
    const { container } = render(
      <AppShellNotices
        updateStatus={createUpdateStatus()}
        zoneRulesUpdate={
          { readyRelease: undefined, dismiss: vi.fn() } as ZoneRulesUpdate
        }
        reloadPage={vi.fn()}
        hasStorageWarning={false}
        shareNotice={undefined}
        onDismissShareNotice={vi.fn()}
      />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it("should show the update notice when the update is available", () => {
    renderNotices({
      updateStatus: createUpdateStatus({ isUpdateAvailable: true }),
    });
    expect(screen.getByText("A new version is available.")).toBeInTheDocument();
  });

  it("should show no update notice for a silent update", () => {
    renderNotices({
      updateStatus: createUpdateStatus({ isBuildWaiting: true }),
    });
    expect(screen.queryByText("A new version is available.")).toBeNull();
  });

  it("should show the offline-ready notice when no update is available", () => {
    renderNotices({
      updateStatus: createUpdateStatus({ isOfflineReady: true }),
    });
    expect(
      screen.getByText("The app is ready to work offline."),
    ).toBeInTheDocument();
  });

  it("should apply a silent update from the Reload of the zone rules notice", async () => {
    const updateStatus = createUpdateStatus({ isBuildWaiting: true });
    const { reloadPage } = renderNotices({
      updateStatus,
      readyRelease: READY_RELEASE,
    });
    await userEvent.click(screen.getByRole("button", { name: "Reload" }));
    expect(updateStatus.applyUpdate).toHaveBeenCalledTimes(1);
    expect(reloadPage).not.toHaveBeenCalled();
  });

  it("should reload the page from the zone rules notice when no build waits", async () => {
    const { reloadPage, updateStatus } = renderNotices({
      readyRelease: READY_RELEASE,
    });
    await userEvent.click(screen.getByRole("button", { name: "Reload" }));
    expect(reloadPage).toHaveBeenCalledTimes(1);
    expect(updateStatus.applyUpdate).not.toHaveBeenCalled();
  });

  it("should show the storage warning and the share notice", () => {
    renderNotices({
      hasStorageWarning: true,
      shareNotice: MeetingShareNotice.COPIED,
    });
    expect(
      screen.getAllByRole("button", { name: "Dismiss" }).length,
    ).toBeGreaterThan(0);
  });
});
