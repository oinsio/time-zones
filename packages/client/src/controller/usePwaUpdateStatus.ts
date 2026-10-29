import { useRegisterSW } from "virtual:pwa-register/react";
import { useCallback, useEffect, useState } from "react";
import { type Clock, systemClock } from "@/lib/temporal";
import { useOnlineStatus } from "./useOnlineStatus";
import { useUpdateRecheckOnReturn } from "./useUpdateRecheckOnReturn";

export interface PwaUpdateStatus {
  isOfflineReady: boolean;
  isUpdateAvailable: boolean;
  /** The check for a new version failed because the network is unreachable. */
  isUpdateCheckFailed: boolean;
  applyUpdate: () => Promise<void>;
  dismiss: () => void;
}

/**
 * Service worker state for the offline-ready and update notices. The app
 * reloads into a new version only when `applyUpdate` is called.
 * Implements FR6, FR7 of setup-app-shell-and-pages-deploy and FR8 of
 * add-main-page-scaffold, and FR10 of support-legacy-ios-12-safari (the check
 * repeats when the page returns to the screen).
 */
export function usePwaUpdateStatus(
  clock: Clock = systemClock,
): PwaUpdateStatus {
  const [registration, setRegistration] = useState<
    ServiceWorkerRegistration | undefined
  >();
  const {
    offlineReady: [isOfflineReady, setOfflineReady],
    needRefresh: [isUpdateAvailable, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW: (_serviceWorkerUrl, registeredWorker) => {
      setRegistration(registeredWorker);
      registeredWorker?.update().catch(() => setIsUpdateCheckFailed(true));
    },
  });
  const [isUpdateCheckFailed, setIsUpdateCheckFailed] = useState(false);
  const isOnline = useOnlineStatus();
  const markUpdateCheckFailed = useCallback(
    () => setIsUpdateCheckFailed(true),
    [],
  );
  useUpdateRecheckOnReturn(registration, clock, markUpdateCheckFailed);

  useEffect(() => {
    if (isOnline) setIsUpdateCheckFailed(false);
  }, [isOnline]);

  const shouldReloadPage = true;

  return {
    isOfflineReady,
    isUpdateAvailable,
    isUpdateCheckFailed,
    applyUpdate: () => updateServiceWorker(shouldReloadPage),
    dismiss: () => {
      setOfflineReady(false);
      setNeedRefresh(false);
    },
  };
}
