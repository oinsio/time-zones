import {
  LocationsProvider,
  useDocumentLanguage,
  useLocations,
  usePwaUpdateStatus,
  useStorageAvailability,
} from "@/controller";
import { type Clock, systemClock } from "@/lib/temporal";
import { DateBar } from "@/views/shared";
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
 * (D3), and FR8 of select-date-with-calendar-and-now (D7), and FR10 of
 * support-legacy-ios-12-safari (D10: the clock is handed down to the update
 * recheck and the locations).
 */
export function AppShell({ clock = systemClock }: { clock?: Clock }) {
  return (
    <LocationsProvider clock={clock}>
      <AppShellContent clock={clock} />
    </LocationsProvider>
  );
}

function AppShellContent({ clock }: { clock: Clock }) {
  useDocumentLanguage();
  const { hasSaveFailed } = useLocations();
  const {
    isOfflineReady,
    isUpdateAvailable,
    isUpdateCheckFailed,
    applyUpdate,
    dismiss,
  } = usePwaUpdateStatus(clock);
  const isStorageAvailable = useStorageAvailability();

  return (
    <MainPage
      bottomBar={<DateBar />}
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
