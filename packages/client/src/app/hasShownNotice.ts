import type { MeetingShareNotice, PwaUpdateStatus } from "@/controller";

interface NoticeConditions {
  updateStatus: Pick<PwaUpdateStatus, "isOfflineReady" | "isUpdateAvailable">;
  readyRelease: string | undefined;
  hasStorageWarning: boolean;
  shareNotice: MeetingShareNotice | undefined;
}

/**
 * Whether the notices region has anything to show, so AppShell loads its lazy
 * chunk only then. Kept apart from AppShellNotices to stay in the main chunk;
 * a new notice is added here and there together.
 * Implements NFR-P1 of apply-data-updates-silently.
 */
export function hasShownNotice({
  updateStatus,
  readyRelease,
  hasStorageWarning,
  shareNotice,
}: NoticeConditions): boolean {
  return (
    updateStatus.isUpdateAvailable ||
    updateStatus.isOfflineReady ||
    readyRelease !== undefined ||
    hasStorageWarning ||
    shareNotice !== undefined
  );
}
