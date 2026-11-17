import { useCallback } from "react";
import type { Clock } from "@/lib/temporal";
import { useRecheckOnReturn } from "./useRecheckOnReturn";

/** A failed update check is silent: the app works offline and needs no note. */
export const ignoreFailedUpdateCheck = () => undefined;

/**
 * Checks for a new version when the page becomes visible again, once
 * `UPDATE_RECHECK_INTERVAL_MS` has passed since the last check. The start-up
 * check counts from the moment the registration appears. A rejected check is
 * swallowed. The scheduling is `useRecheckOnReturn`.
 * Implements FR10 of support-legacy-ios-12-safari (D10).
 * Implements FR7 of polish-settings-and-remove-offline-update-notice (D6).
 * Implements FR5 of apply-data-updates-silently (D3): `onRecheckWhileBuildWaiting`
 * runs with each check, and is given only while a build is waiting.
 */
export function useUpdateRecheckOnReturn(
  registration: ServiceWorkerRegistration | undefined,
  clock: Clock,
  onRecheckWhileBuildWaiting?: () => void,
): void {
  const onRecheck = useCallback(() => {
    // Stryker disable next-line OptionalChaining: equivalent — useRecheckOnReturn never calls onRecheck while registration is undefined (isEnabled is false)
    registration?.update().catch(ignoreFailedUpdateCheck);
    onRecheckWhileBuildWaiting?.();
  }, [registration, onRecheckWhileBuildWaiting]);
  useRecheckOnReturn({
    onRecheck,
    clock,
    isEnabled: registration !== undefined,
  });
}
