import { lazy, Suspense } from "react";
import type { AppShellNoticesProps } from "./AppShellNotices";
import { hasShownNotice } from "./hasShownNotice";

/** The notices region loads only when a notice is due (hasShownNotice), as notices appear rarely and the initial JavaScript is budgeted (NFR-P1 of apply-data-updates-silently). */
const AppShellNotices = lazy(async () => ({
  default: (await import("./AppShellNotices")).AppShellNotices,
}));

/**
 * The notices region of the app frame, rendered and loaded only when a notice
 * is due.
 * Implements NFR-P1 of apply-data-updates-silently.
 */
export function LazyAppShellNotices(props: AppShellNoticesProps) {
  const { updateStatus, zoneRulesUpdate, hasStorageWarning, shareNotice } =
    props;
  if (
    !hasShownNotice({
      updateStatus,
      readyRelease: zoneRulesUpdate.readyRelease,
      hasStorageWarning,
      shareNotice,
    })
  ) {
    return null;
  }
  return (
    <Suspense fallback={null}>
      <AppShellNotices {...props} />
    </Suspense>
  );
}
