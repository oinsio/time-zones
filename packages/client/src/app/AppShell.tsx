import {
  useDocumentLanguage,
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
 * FR1, FR8, FR9 of add-main-page-scaffold.
 */
export function AppShell() {
  useDocumentLanguage();
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
          {!isStorageAvailable && <StorageWarning />}
        </>
      }
    />
  );
}
