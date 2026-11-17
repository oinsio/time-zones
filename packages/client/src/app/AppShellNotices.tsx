import type {
  MeetingShareNotice as MeetingShareNoticeKind,
  PwaUpdateStatus,
  ZoneRulesUpdate,
} from "@/controller";
import { getDueNotices } from "./hasShownNotice";
import { MeetingShareNotice } from "./MeetingShareNotice";
import { OfflineReadyNotice } from "./OfflineReadyNotice";
import { StorageWarning } from "./StorageWarning";
import { UpdateNotice } from "./UpdateNotice";
import { ZoneRulesUpdateNoticeSlot } from "./ZoneRulesUpdateNoticeSlot";

export type AppShellNoticesProps = {
  updateStatus: PwaUpdateStatus;
  zoneRulesUpdate: ZoneRulesUpdate;
  reloadPage: () => void;
  hasStorageWarning: boolean;
  shareNotice: MeetingShareNoticeKind | undefined;
  onDismissShareNotice: () => void;
};

/**
 * The notices region of the app frame: the update or offline-ready notice, the
 * zone rules update notice, the storage warning and the share notice.
 * Implements FR3, FR4, FR11 of apply-data-updates-silently (D3): the zone rules
 * notice's Reload applies a waiting build whether or not its notice is shown.
 */
export function AppShellNotices({
  updateStatus,
  zoneRulesUpdate,
  reloadPage,
  hasStorageWarning,
  shareNotice,
  onDismissShareNotice,
}: AppShellNoticesProps) {
  const { isBuildWaiting } = updateStatus;
  const dueNotices = getDueNotices({
    updateStatus,
    readyRelease: zoneRulesUpdate.readyRelease,
    hasStorageWarning,
    shareNotice,
  });
  return (
    <>
      {dueNotices.isUpdateNoticeDue && (
        <UpdateNotice
          onReload={updateStatus.applyUpdate}
          onDismiss={updateStatus.dismiss}
        />
      )}
      {dueNotices.isOfflineReadyNoticeDue && (
        <OfflineReadyNotice onDismiss={updateStatus.dismiss} />
      )}
      {dueNotices.isZoneRulesNoticeDue && (
        <ZoneRulesUpdateNoticeSlot
          readyRelease={zoneRulesUpdate.readyRelease}
          isBuildWaiting={isBuildWaiting}
          applyUpdate={updateStatus.applyUpdate}
          reloadPage={reloadPage}
          onDismiss={zoneRulesUpdate.dismiss}
        />
      )}
      {dueNotices.isStorageWarningDue && <StorageWarning />}
      {dueNotices.isShareNoticeDue && shareNotice !== undefined && (
        <MeetingShareNotice
          kind={shareNotice}
          onDismiss={onDismissShareNotice}
        />
      )}
    </>
  );
}
