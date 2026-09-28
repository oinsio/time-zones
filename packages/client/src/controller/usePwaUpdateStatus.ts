import { useRegisterSW } from "virtual:pwa-register/react";

export interface PwaUpdateStatus {
  isOfflineReady: boolean;
  isUpdateAvailable: boolean;
  applyUpdate: () => Promise<void>;
  dismiss: () => void;
}

/**
 * Service worker state for the offline-ready and update notices. The app
 * reloads into a new version only when `applyUpdate` is called.
 * Implements FR6, FR7 of setup-app-shell-and-pages-deploy.
 */
export function usePwaUpdateStatus(): PwaUpdateStatus {
  const {
    offlineReady: [isOfflineReady, setOfflineReady],
    needRefresh: [isUpdateAvailable, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW();

  const shouldReloadPage = true;

  return {
    isOfflineReady,
    isUpdateAvailable,
    applyUpdate: () => updateServiceWorker(shouldReloadPage),
    dismiss: () => {
      setOfflineReady(false);
      setNeedRefresh(false);
    },
  };
}
