import type {
  MeetingShareNotice as MeetingShareNoticeKind,
  PwaUpdateStatus,
  ZoneRulesUpdate,
} from "@/controller";
import { MeetingShareNotice } from "./MeetingShareNotice";
import { OfflineReadyNotice } from "./OfflineReadyNotice";
import { StorageWarning } from "./StorageWarning";
import { UpdateNotice } from "./UpdateNotice";
import { ZoneRulesUpdateNoticeSlot } from "./ZoneRulesUpdateNoticeSlot";

type AppShellNoticesProps = {
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
  const { isOfflineReady, isBuildWaiting, isUpdateAvailable } = updateStatus;
  return (
    <>
      {isUpdateAvailable ? (
        <UpdateNotice
          onReload={updateStatus.applyUpdate}
          onDismiss={updateStatus.dismiss}
        />
      ) : (
        isOfflineReady && (
          <OfflineReadyNotice onDismiss={updateStatus.dismiss} />
        )
      )}
      <ZoneRulesUpdateNoticeSlot
        readyRelease={zoneRulesUpdate.readyRelease}
        isBuildWaiting={isBuildWaiting}
        applyUpdate={updateStatus.applyUpdate}
        reloadPage={reloadPage}
        onDismiss={zoneRulesUpdate.dismiss}
      />
      {hasStorageWarning && <StorageWarning />}
      {shareNotice !== undefined && (
        <MeetingShareNotice
          kind={shareNotice}
          onDismiss={onDismissShareNotice}
        />
      )}
    </>
  );
}
