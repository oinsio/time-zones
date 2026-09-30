import {
  LocationsProvider,
  useDocumentLanguage,
  useLocations,
  usePwaUpdateStatus,
  useStorageAvailability,
} from "@/controller";
import { MainPage } from "./MainPage";
import { OfflineReadyNotice } from "./OfflineReadyNotice";
import { StorageWarning } from "./StorageWarning";
import { UpdateCheckFailedNote } from "./UpdateCheckFailedNote";
import { UpdateNotice } from "./UpdateNotice";

/**
 * Application frame: owns the hooks and the notices, and renders the main
 * page. Renders an empty content region while the registry is empty.
 * Implements FR2, FR6, FR7, FR11, UX2 of setup-app-shell-and-pages-deploy and
 * FR1, FR8, FR9 of add-main-page-scaffold and FR13 of add-locations-via-search
 * (D3).
 */
export function AppShell() {
  return (
    <LocationsProvider>
      <AppShellContent />
    </LocationsProvider>
  );
}

function AppShellContent() {
  useDocumentLanguage();
  const { hasSaveFailed } = useLocations();
  const {
    isOfflineReady,
    isUpdateAvailable,
    isUpdateCheckFailed,
    applyUpdate,
    dismiss,
  } = usePwaUpdateStatus();
  const isStorageAvailable = useStorageAvailability();

  return (
    <MainPage
      notices={
        <>
          {isUpdateAvailable ? (
            <UpdateNotice onReload={applyUpdate} onDismiss={dismiss} />
          ) : (
            isOfflineReady && <OfflineReadyNotice onDismiss={dismiss} />
          )}
          {isUpdateCheckFailed && <UpdateCheckFailedNote />}
          {(!isStorageAvailable || hasSaveFailed) && <StorageWarning />}
        </>
      }
    />
  );
}
