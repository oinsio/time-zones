import { useRegisterSW } from "virtual:pwa-register/react";
import { useEffect, useState } from "react";
import { useOnlineStatus } from "./useOnlineStatus";

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
 * add-main-page-scaffold.
 */
export function usePwaUpdateStatus(): PwaUpdateStatus {
  const {
    offlineReady: [isOfflineReady, setOfflineReady],
    needRefresh: [isUpdateAvailable, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW: (_serviceWorkerUrl, registration) => {
      registration?.update().catch(() => setIsUpdateCheckFailed(true));
    },
  });
  const [isUpdateCheckFailed, setIsUpdateCheckFailed] = useState(false);
  const isOnline = useOnlineStatus();

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
