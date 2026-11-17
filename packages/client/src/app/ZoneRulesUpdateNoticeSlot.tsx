import { ZoneRulesUpdateNotice } from "./ZoneRulesUpdateNotice";

interface ZoneRulesUpdateNoticeSlotProps {
  /** The stored release Reload will use; nothing is shown without one. */
  readyRelease: string | undefined;
  /** A newer build waits, whether or not the update notice is shown. */
  isBuildWaiting: boolean;
  applyUpdate: () => void;
  reloadPage: () => void;
  onDismiss: () => void;
}

/**
 * Places the zone rules update notice in the notices region and decides what
 * its Reload does: with a waiting build, shown or silent, it applies that
 * build, which restarts the page and so applies the stored release too; a
 * plain reload would leave the waiting service worker waiting.
 * Implements FR7, UX1 of add-remote-zone-rules-updates (design D5).
 * Implements FR11 of apply-data-updates-silently (D3): a silent update counts.
 */
export function ZoneRulesUpdateNoticeSlot({
  readyRelease,
  isBuildWaiting,
  applyUpdate,
  reloadPage,
  onDismiss,
}: ZoneRulesUpdateNoticeSlotProps) {
  if (readyRelease === undefined) return null;
  return (
    <ZoneRulesUpdateNotice
      release={readyRelease}
      onReload={isBuildWaiting ? applyUpdate : reloadPage}
      onDismiss={onDismiss}
    />
  );
}
