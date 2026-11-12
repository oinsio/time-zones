import { ZoneRulesUpdateNotice } from "./ZoneRulesUpdateNotice";

interface ZoneRulesUpdateNoticeSlotProps {
  /** The stored release Reload will use; nothing is shown without one. */
  readyRelease: string | undefined;
  isUpdateAvailable: boolean;
  applyUpdate: () => void;
  reloadPage: () => void;
  onDismiss: () => void;
}

/**
 * Places the zone rules update notice in the notices region and decides what
 * its Reload does: with a waiting update it applies that update, which
 * restarts the page and so applies the stored release too; a plain reload
 * would leave the waiting service worker waiting.
 * Implements FR7, UX1 of add-remote-zone-rules-updates (design D5).
 */
export function ZoneRulesUpdateNoticeSlot({
  readyRelease,
  isUpdateAvailable,
  applyUpdate,
  reloadPage,
  onDismiss,
}: ZoneRulesUpdateNoticeSlotProps) {
  if (readyRelease === undefined) return null;
  return (
    <ZoneRulesUpdateNotice
      release={readyRelease}
      onReload={isUpdateAvailable ? applyUpdate : reloadPage}
      onDismiss={onDismiss}
    />
  );
}
