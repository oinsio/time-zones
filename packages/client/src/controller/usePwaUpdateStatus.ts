import { useRegisterSW } from "virtual:pwa-register/react";
import { useState } from "react";
import { type Clock, systemClock } from "@/lib/temporal";
import {
  ignoreFailedUpdateCheck,
  useUpdateRecheckOnReturn,
} from "./useUpdateRecheckOnReturn";

export interface PwaUpdateStatus {
  isOfflineReady: boolean;
  isUpdateAvailable: boolean;
  applyUpdate: () => Promise<void>;
  dismiss: () => void;
}

/**
 * Service worker state for the offline-ready and update notices. The app
 * reloads into a new version only when `applyUpdate` is called.
 * Implements FR6, FR7 of setup-app-shell-and-pages-deploy and FR8 of
 * add-main-page-scaffold, and FR10 of support-legacy-ios-12-safari (the check
 * repeats when the page returns to the screen).
 * Implements FR7, FR8 of polish-settings-and-remove-offline-update-notice (D6):
 * a failed check is swallowed and reported nowhere.
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
      registeredWorker?.update().catch(ignoreFailedUpdateCheck);
    },
  });
  useUpdateRecheckOnReturn(registration, clock);

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
