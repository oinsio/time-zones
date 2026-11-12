import { lazy, Suspense, useEffect, useRef, useState } from "react";
import {
  fetchZoneRulesVersionSource,
  localStorageStoredReleaseRepository,
} from "@/adapters";
import { ADD_LOCATION_BUTTON_ID, KeyboardKey } from "@/constants";
import {
  LocationsProvider,
  LocationsStatus,
  PreferencesProvider,
  useDocumentLanguage,
  useInterfaceLanguage,
  useLocations,
  useMeetingBar,
  useMeetingRange,
  useMeetingShare,
  usePwaUpdateStatus,
  useStorageAvailability,
  useThemePreference,
  useViewMode,
  useZoneRulesUpdate,
} from "@/controller";
import { type Clock, systemClock } from "@/lib/temporal";
import type {
  StoredReleaseRepository,
  TextSharing,
  ZoneRulesVersionSource,
} from "@/ports";
import { resolveActiveView, viewRegistry } from "@/views";
import { DateBar, LocationSearch, MeetingBar } from "@/views/shared";
import { AppPage } from "./appPage";
import { MainPage } from "./MainPage";
import { MeetingShareNotice } from "./MeetingShareNotice";
import { OfflineReadyNotice } from "./OfflineReadyNotice";
import { SettingsButton } from "./SettingsButton";
import { StorageWarning } from "./StorageWarning";
import { UpdateNotice } from "./UpdateNotice";
import { ViewSkeleton } from "./ViewSkeleton";
import { ZoneRulesUpdateNoticeSlot } from "./ZoneRulesUpdateNoticeSlot";

const reloadWindow = () => window.location.reload();

/** Loaded on demand so the settings page stays out of the initial JavaScript (NFR-P1 budget). */
const SettingsPage = lazy(async () => ({
  default: (await import("./settings")).SettingsPage,
}));

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
 * Implements FR13, FR15 of add-grid-meeting-range-and-share (D7): the meeting bar, its Clear
 * and Share, and the share notice; `textSharing` is the port Share meeting uses.
 * Implements FR7 of add-remote-zone-rules-updates (D5): the zone rules update notice;
 * `zoneRulesVersionSource`, `storedReleases` and `reloadPage` are its ports and its Reload.
 */
export type AppShellDependencies = {
  clock?: Clock;
  textSharing?: TextSharing;
  zoneRulesVersionSource?: ZoneRulesVersionSource;
  storedReleases?: StoredReleaseRepository;
  reloadPage?: () => void;
};

export function AppShell({
  clock = systemClock,
  ...dependencies
}: AppShellDependencies) {
  return (
    <PreferencesProvider>
      <LocationsProvider clock={clock}>
        <AppShellContent clock={clock} {...dependencies} />
      </LocationsProvider>
    </PreferencesProvider>
  );
}

/** Implements FR5, FR7 of add-interface-language-selection (D3): `useInterfaceLanguage` applies the language. */
function AppShellContent({
  clock,
  textSharing,
  zoneRulesVersionSource = fetchZoneRulesVersionSource,
  storedReleases = localStorageStoredReleaseRepository,
  reloadPage = reloadWindow,
}: AppShellDependencies & { clock: Clock }) {
  useDocumentLanguage();
  useThemePreference();
  useInterfaceLanguage();
  const { hasSaveFailed, loadStatus } = useLocations();
  const { isOfflineReady, isUpdateAvailable, applyUpdate, dismiss } =
    usePwaUpdateStatus(clock);
  const zoneRulesUpdate = useZoneRulesUpdate({
    clock,
    versionSource: zoneRulesVersionSource,
    storedReleases,
  });
  const isStorageAvailable = useStorageAvailability();
  const [page, setPage] = useState(AppPage.MAIN);
  const settingsButtonRef = useRef<HTMLButtonElement>(null);
  const isReturningFromSettings = useRef(false);
  const activeView = resolveActiveView(viewRegistry, useViewMode());
  const meetingBar = useMeetingBar(activeView?.showsMeetingRange === true);
  const { clearMeetingRange } = useMeetingRange();
  const { shareMeeting, notice, dismissNotice } = useMeetingShare(textSharing);
  const isFocusAfterClearDue = useRef(false);

  useEffect(() => {
    if (meetingBar !== undefined || !isFocusAfterClearDue.current) return;
    isFocusAfterClearDue.current = false;
    document.getElementById(ADD_LOCATION_BUTTON_ID)?.focus();
  }, [meetingBar]);

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
      <ZoneRulesUpdateNoticeSlot
        readyRelease={zoneRulesUpdate.readyRelease}
        isUpdateAvailable={isUpdateAvailable}
        applyUpdate={applyUpdate}
        reloadPage={reloadPage}
        onDismiss={zoneRulesUpdate.dismiss}
      />
      {(!isStorageAvailable || hasSaveFailed) && <StorageWarning />}
      {notice !== undefined && (
        <MeetingShareNotice kind={notice} onDismiss={dismissNotice} />
      )}
    </>
  );

  if (page === AppPage.SETTINGS) {
    return (
      <Suspense fallback={<ViewSkeleton />}>
        <SettingsPage
          notices={notices}
          onBack={() => {
            isReturningFromSettings.current = true;
            setPage(AppPage.MAIN);
          }}
        />
      </Suspense>
    );
  }

  return (
    <MainPage
      bottomBar={<DateBar />}
      notices={notices}
      meetingBar={
        meetingBar && (
          <MeetingBar
            bar={meetingBar}
            onShare={shareMeeting}
            onClear={() => {
              isFocusAfterClearDue.current = true;
              clearMeetingRange();
            }}
          />
        )
      }
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
