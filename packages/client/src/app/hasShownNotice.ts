import type { MeetingShareNotice, PwaUpdateStatus } from "@/controller";

export interface NoticeConditions {
  updateStatus: Pick<PwaUpdateStatus, "isOfflineReady" | "isUpdateAvailable">;
  readyRelease: string | undefined;
  hasStorageWarning: boolean;
  shareNotice: MeetingShareNotice | undefined;
}

export interface DueNotices {
  isUpdateNoticeDue: boolean;
  isOfflineReadyNoticeDue: boolean;
  isZoneRulesNoticeDue: boolean;
  isStorageWarningDue: boolean;
  isShareNoticeDue: boolean;
}

/**
 * Which notices of the region are due: the one owner of the notice conditions,
 * read by AppShellNotices to render and by hasShownNotice to gate its chunk.
 * Implements NFR-P1 of apply-data-updates-silently.
 */
export function getDueNotices({
  updateStatus,
  readyRelease,
  hasStorageWarning,
  shareNotice,
}: NoticeConditions): DueNotices {
  return {
    isUpdateNoticeDue: updateStatus.isUpdateAvailable,
    isOfflineReadyNoticeDue:
      !updateStatus.isUpdateAvailable && updateStatus.isOfflineReady,
    isZoneRulesNoticeDue: readyRelease !== undefined,
    isStorageWarningDue: hasStorageWarning,
    isShareNoticeDue: shareNotice !== undefined,
  };
}

/**
 * Whether the notices region has anything to show, so AppShell loads its lazy
 * chunk only then.
 * Implements NFR-P1 of apply-data-updates-silently.
 */
export function hasShownNotice(conditions: NoticeConditions): boolean {
  return Object.values(getDueNotices(conditions)).some(Boolean);
}
