import { useEffect, useRef } from "react";
import {
  UPDATE_RECHECK_INTERVAL_MS,
  VISIBILITY_CHANGE_EVENT,
  VISIBLE_STATE,
} from "@/constants";
import type { Clock } from "@/lib/temporal";

/** A failed update check is silent: the app works offline and needs no note. */
export const ignoreFailedUpdateCheck = () => undefined;

/**
 * Checks for a new version when the page becomes visible again, once
 * `UPDATE_RECHECK_INTERVAL_MS` has passed since the last check. The start-up
 * check counts from the moment the registration appears. iOS never restarts
 * an installed PWA (WebKit bug 199110), so the page asks again on return.
 * A rejected check is swallowed.
 * Implements FR10 of support-legacy-ios-12-safari (D10).
 * Implements FR7 of polish-settings-and-remove-offline-update-notice (D6).
 */
export function useUpdateRecheckOnReturn(
  registration: ServiceWorkerRegistration | undefined,
  clock: Clock,
): void {
  const lastCheckMilliseconds = useRef<number | null>(null);

  // biome-ignore lint/correctness/useExhaustiveDependencies: the start-up check counts from the moment the registration appears
  useEffect(() => {
    lastCheckMilliseconds.current = clock.instant().epochMilliseconds;
  }, [registration, clock]);

  useEffect(() => {
    if (registration === undefined) return;
    const handleVisibilityChange = () => {
      if (document.visibilityState !== VISIBLE_STATE) return;
      const nowMilliseconds = clock.instant().epochMilliseconds;
      const lastMilliseconds = lastCheckMilliseconds.current ?? nowMilliseconds;
      if (nowMilliseconds - lastMilliseconds < UPDATE_RECHECK_INTERVAL_MS) {
        return;
      }
      lastCheckMilliseconds.current = nowMilliseconds;
      registration.update().catch(ignoreFailedUpdateCheck);
    };
    document.addEventListener(VISIBILITY_CHANGE_EVENT, handleVisibilityChange);
    return () =>
      document.removeEventListener(
        VISIBILITY_CHANGE_EVENT,
        handleVisibilityChange,
      );
  }, [registration, clock]);
}
