import { useEffect, useRef, useState } from "react";
import { KeyboardKey } from "@/constants";
import {
  LocationsProvider,
  LocationsStatus,
  PreferencesProvider,
  useDocumentLanguage,
  useLocations,
  usePwaUpdateStatus,
  useStorageAvailability,
  useThemePreference,
} from "@/controller";
import { type Clock, systemClock } from "@/lib/temporal";
import { DateBar, LocationSearch } from "@/views/shared";
import { AppPage } from "./appPage";
import { MainPage } from "./MainPage";
import { OfflineReadyNotice } from "./OfflineReadyNotice";
import { SettingsButton } from "./SettingsButton";
import { SettingsPage } from "./SettingsPage";
import { StorageWarning } from "./StorageWarning";
import { UpdateCheckFailedNote } from "./UpdateCheckFailedNote";
import { UpdateNotice } from "./UpdateNotice";

/**
 * Application frame: owns the hooks and the notices, and renders the main
 * page or the settings page. Renders an empty content region while the
 * registry is empty.
 * Implements FR2, FR6, FR7, FR11, UX2 of setup-app-shell-and-pages-deploy and
 * FR1, FR8, FR9 of add-main-page-scaffold and FR13 of add-locations-via-search
 * (D3), and FR8 of select-date-with-calendar-and-now (D7), and FR10 of
 * support-legacy-ios-12-safari (D10: the clock is handed down to the update
 * recheck and the locations).
 * Implements FR1, FR2, FR3, FR4 of add-settings-page-and-device-time-location
 * (D5, D7, D10, D11): the preferences, the theme, the page state and the header buttons.
 */
export function AppShell({ clock = systemClock }: { clock?: Clock }) {
  return (
    <PreferencesProvider>
      <LocationsProvider clock={clock}>
        <AppShellContent clock={clock} />
      </LocationsProvider>
    </PreferencesProvider>
  );
}

function AppShellContent({ clock }: { clock: Clock }) {
  useDocumentLanguage();
  useThemePreference();
  const { hasSaveFailed, loadStatus } = useLocations();
  const {
    isOfflineReady,
    isUpdateAvailable,
    isUpdateCheckFailed,
    applyUpdate,
    dismiss,
  } = usePwaUpdateStatus(clock);
  const isStorageAvailable = useStorageAvailability();
  const [page, setPage] = useState(AppPage.MAIN);
  const settingsButtonRef = useRef<HTMLButtonElement>(null);
  const isReturningFromSettings = useRef(false);

  useEffect(() => {
    if (page !== AppPage.MAIN || !isReturningFromSettings.current) return;
    isReturningFromSettings.current = false;
    settingsButtonRef.current?.focus();
  }, [page]);

  useEffect(() => {
    if (page !== AppPage.SETTINGS) return;
    const onKeyDown = (keyboardEvent: KeyboardEvent) => {
      if (keyboardEvent.key !== KeyboardKey.ESCAPE) return;
      isReturningFromSettings.current = true;
      setPage(AppPage.MAIN);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [page]);

  const notices = (
    <>
      {isUpdateAvailable ? (
        <UpdateNotice onReload={applyUpdate} onDismiss={dismiss} />
      ) : (
        isOfflineReady && <OfflineReadyNotice onDismiss={dismiss} />
      )}
      {isUpdateCheckFailed && <UpdateCheckFailedNote />}
      {(!isStorageAvailable || hasSaveFailed) && <StorageWarning />}
    </>
  );

  if (page === AppPage.SETTINGS) {
    return (
      <SettingsPage
        notices={notices}
        onBack={() => {
          isReturningFromSettings.current = true;
          setPage(AppPage.MAIN);
        }}
      />
    );
  }

  return (
    <MainPage
      bottomBar={<DateBar />}
      notices={notices}
      headerActions={
        <>
          {loadStatus !== LocationsStatus.UNREADABLE && <LocationSearch />}
          <SettingsButton
            ref={settingsButtonRef}
            onClick={() => setPage(AppPage.SETTINGS)}
          />
        </>
      }
    />
  );
}
