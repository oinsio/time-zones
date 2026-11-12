import { useEffect, useRef } from "react";
import {
  UPDATE_RECHECK_INTERVAL_MS,
  VISIBILITY_CHANGE_EVENT,
  VISIBLE_STATE,
} from "@/constants";
import type { Clock } from "@/lib/temporal";

export type RecheckOnReturnOptions = {
  /** Runs the check; the caller handles its failures. */
  onRecheck: () => void;
  clock: Clock;
  isEnabled: boolean;
};

/**
 * Runs `onRecheck` when the page becomes visible again, once
 * `UPDATE_RECHECK_INTERVAL_MS` has passed since the last check. The start-up
 * check counts from the moment the recheck is enabled. iOS never restarts an
 * installed PWA (WebKit bug 199110), so the page asks again on return.
 * The one scheduling shared by the update recheck and the zone rules update
 * check. Implements FR10 of support-legacy-ios-12-safari (D10),
 * FR7 of polish-settings-and-remove-offline-update-notice (D6),
 * FR3 of add-remote-zone-rules-updates (D4).
 */
export function useRecheckOnReturn({
  onRecheck,
  clock,
  isEnabled,
}: RecheckOnReturnOptions): void {
  const lastCheckMilliseconds = useRef<number | null>(null);
  const latestOnRecheck = useRef(onRecheck);
  latestOnRecheck.current = onRecheck;

  // biome-ignore lint/correctness/useExhaustiveDependencies: the start-up check counts from the moment the recheck is enabled
  useEffect(() => {
    lastCheckMilliseconds.current = clock.instant().epochMilliseconds;
  }, [isEnabled, clock]);

  useEffect(() => {
    if (!isEnabled) return;
    const handleVisibilityChange = () => {
      if (document.visibilityState !== VISIBLE_STATE) return;
      const nowMilliseconds = clock.instant().epochMilliseconds;
      const lastMilliseconds = lastCheckMilliseconds.current ?? nowMilliseconds;
      if (nowMilliseconds - lastMilliseconds < UPDATE_RECHECK_INTERVAL_MS) {
        return;
      }
      lastCheckMilliseconds.current = nowMilliseconds;
      latestOnRecheck.current();
    };
    document.addEventListener(VISIBILITY_CHANGE_EVENT, handleVisibilityChange);
    return () =>
      document.removeEventListener(
        VISIBILITY_CHANGE_EVENT,
        handleVisibilityChange,
      );
  }, [isEnabled, clock]);
}
