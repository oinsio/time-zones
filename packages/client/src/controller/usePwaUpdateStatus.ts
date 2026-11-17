import { useRegisterSW } from "virtual:pwa-register/react";
import { useEffect, useState } from "react";
import { fetchAppRevisionSource } from "@/adapters";
import { APP_REVISION } from "@/constants";
import { type Clock, systemClock } from "@/lib/temporal";
import type { AppRevisionSource } from "@/ports";
import { usePublishedAppRevision } from "./usePublishedAppRevision";
import {
  ignoreFailedUpdateCheck,
  useUpdateRecheckOnReturn,
} from "./useUpdateRecheckOnReturn";

export interface PwaUpdateStatus {
  isOfflineReady: boolean;
  /** A newer build is installed and waits; the update notice may still be hidden (silent update). */
  isBuildWaiting: boolean;
  /** The update notice is shown: the waiting build has another app revision. */
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
 * Implements FR3, FR4, FR5, FR6, FR7 of apply-data-updates-silently (D3): the
 * notice is shown only when the app revision of the site differs from the
 * running build's; a dismissal records the revision it hid.
 */
export function usePwaUpdateStatus(
  clock: Clock = systemClock,
  appRevisionSource: AppRevisionSource = fetchAppRevisionSource,
): PwaUpdateStatus {
  const [registration, setRegistration] = useState<
    ServiceWorkerRegistration | undefined
  >();
  const {
    offlineReady: [isOfflineReady, setOfflineReady],
    needRefresh: [isBuildWaiting],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW: (_serviceWorkerUrl, registeredWorker) => {
      setRegistration(registeredWorker);
      registeredWorker?.update().catch(ignoreFailedUpdateCheck);
    },
  });
  const { appRevision: publishedAppRevision, readAppRevision } =
    usePublishedAppRevision(appRevisionSource);
  const [dismissedAppRevision, setDismissedAppRevision] = useState<
    string | undefined
  >();

  useEffect(() => {
    if (isBuildWaiting) readAppRevision();
  }, [isBuildWaiting, readAppRevision]);

  useUpdateRecheckOnReturn(
    registration,
    clock,
    isBuildWaiting ? readAppRevision : undefined,
  );

  const isUpdateAvailable =
    isBuildWaiting &&
    publishedAppRevision !== undefined &&
    publishedAppRevision !== APP_REVISION &&
    publishedAppRevision !== dismissedAppRevision;

  const shouldReloadPage = true;

  return {
    isOfflineReady,
    isBuildWaiting,
    isUpdateAvailable,
    applyUpdate: () => updateServiceWorker(shouldReloadPage),
    dismiss: () => {
      setOfflineReady(false);
      setDismissedAppRevision(publishedAppRevision);
    },
  };
}
