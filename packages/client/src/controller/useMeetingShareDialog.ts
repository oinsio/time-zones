import {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useSyncExternalStore,
} from "react";
import { useTranslation } from "react-i18next";
import { createShareDestinations } from "@/adapters";
import { resolveCityNameLanguage, resolveShareLanguage } from "@/locales";
import {
  getMeetingInvitation,
  getReferenceZone,
  isDeviceTimeLocation,
  type Location,
} from "@/model";
import { type ShareDestinationId, ShareOutcome } from "@/ports";
import { DEFAULT_PREFERENCES } from "@/preferences";
import {
  presentMeetingShareReference,
  presentShareDestinationLabel,
} from "@/presenter";
import { LocationsContext } from "./locationsContext";
import { PreferencesContext } from "./preferencesContext";
import { useActiveInterfaceLanguage } from "./useActiveInterfaceLanguage";
import { useCityLabels } from "./useCityLabels";
import { useExemplarCity } from "./useExemplarCity";
import { useHourFormat } from "./useHourFormat";
import { useLocations } from "./useLocations";
import { useMeetingRange } from "./useMeetingRange";
import type { MeetingShare } from "./useMeetingShare";
import { useMeetingShareCommands } from "./useMeetingShareCommands";
import { useMeetingShareDialogRows } from "./useMeetingShareDialogRows";
import { useMeetingShareSession } from "./useMeetingShareSession";
import { useMeetingShareText } from "./useMeetingShareText";
import { useReferenceMoment } from "./useReferenceMoment";

const NO_LOCATIONS: readonly Location[] = [];
const MISSING_PROVIDER_MESSAGE =
  "useMeetingShareDialog must be used inside a LocationsProvider";

/** What the share dialog takes: the session `useMeetingShare` returns. */
export type MeetingShareSession = ReturnType<typeof useMeetingShareDialog>;

export type MeetingShareDestinationButton = {
  id: ShareDestinationId;
  label: string;
};

/**
 * The share dialog session: the ticked locations, the share language of this
 * opening, the dialog rows, the reference line and the previewed meeting share
 * text. Sharing hands the invitation and the text to a share destination and
 * reports the outcome to `useMeetingShare`. Loaded with the dialog (NFR-P2).
 * Implements FR1–FR6, FR8–FR11 of add-meeting-share-dialog (D6).
 * Implements FR5, FR7 of keep-location-menu-in-view-and-clear-range-after-share (D3): `onMeetingShared` is called after a share with the outcome shared, and only then.
 */
export function useMeetingShareDialog(
  shareMeeting: MeetingShare,
  onMeetingShared?: () => void,
) {
  const { isShareDialogOpen, closeShareDialog, finishShare, textSharing } =
    shareMeeting;
  const locationsContext = useContext(LocationsContext);
  if (locationsContext === null) throw new Error(MISSING_PROVIDER_MESSAGE);
  const { store, loadCitySearch } = locationsContext;
  const state = useSyncExternalStore(store.subscribe, store.getSnapshot);
  const preferencesContext = useContext(PreferencesContext);
  const preferences = preferencesContext?.preferences ?? DEFAULT_PREFERENCES;
  const { t, i18n } = useTranslation();
  const { code: interfaceLanguage } = useActiveInterfaceLanguage();
  const hourFormat = useHourFormat();
  const locationsView = useLocations();
  const { rows, locations } = locationsView;
  const { meeting } = useMeetingRange();
  const { dateBar } = useReferenceMoment();
  const session = useMeetingShareSession(meeting !== undefined);
  const destinations = useMemo(
    () => createShareDestinations(textSharing),
    [textSharing],
  );

  const resolvedLanguage = resolveShareLanguage(
    preferences.shareLanguage,
    interfaceLanguage,
  );
  const shareLanguage = session.shareLanguage ?? resolvedLanguage.language;
  const cityNameLanguage = resolveCityNameLanguage(shareLanguage);
  const shareTranslate = useMemo(
    () => i18n.getFixedT(shareLanguage),
    [i18n, shareLanguage],
  );
  const deviceTimeLocation = locations.find(isDeviceTimeLocation);
  // Closed, the session starts no city data load: only the dialog needs these labels.
  const shareCityLabels = useCityLabels(
    isShareDialogOpen ? locations : NO_LOCATIONS,
    loadCitySearch,
    cityNameLanguage,
  );
  const shareDeviceTimeCity = useExemplarCity(
    isShareDialogOpen ? deviceTimeLocation?.timeZoneId : undefined,
    loadCitySearch,
    cityNameLanguage,
  );
  const referenceDeviceTimeCity = useExemplarCity(
    isShareDialogOpen ? state.deviceTimeZoneId : undefined,
    loadCitySearch,
  );

  const meetingRange = meeting?.range;

  // Each opening starts afresh: no ticks, the pinned or the interface language.
  // biome-ignore lint/correctness/useExhaustiveDependencies: only an opening or a closing restarts the session
  useEffect(() => {
    if (isShareDialogOpen) session.open(resolvedLanguage.language);
    else session.close();
  }, [isShareDialogOpen]);

  const invitation = useMemo(
    () =>
      getMeetingInvitation(
        { locations, meeting: meetingRange },
        session.excludedLocationIds,
      ),
    [locations, meetingRange, session.excludedLocationIds],
  );
  const referenceZoneId = getReferenceZone(state);

  const text = useMeetingShareText({
    invitation,
    referenceZoneId,
    hourFormat,
    shareZoneLabelParts: preferences.shareZoneLabelParts,
    shareLanguage,
    shareTranslate,
    shareCityLabels,
    shareDeviceTimeCity,
  });

  const dialogRows = useMeetingShareDialogRows(
    meeting,
    locationsView,
    session.excludedLocationIds,
    t,
  );

  const homeRow = rows.find(({ id }) => id === state.homeLocationId);
  const referenceLine = presentMeetingShareReference(
    {
      fullDateLabel: dateBar.fullDateLabel,
      referenceCityLabel:
        homeRow?.cityLabel ?? referenceDeviceTimeCity ?? referenceZoneId,
    },
    t,
  );

  const share = useCallback(
    async (destinationId: ShareDestinationId) => {
      const destination = destinations.find(({ id }) => id === destinationId);
      if (destination === undefined) return;
      if (invitation === undefined || text === undefined) return;
      const outcome = await destination.share({ invitation, text });
      finishShare(outcome);
      if (outcome === ShareOutcome.SHARED) onMeetingShared?.();
    },
    [destinations, invitation, text, finishShare, onMeetingShared],
  );

  const {
    chooseShareLanguage,
    toggleShareLanguagePin,
    toggleShareZoneLabelPart,
  } = useMeetingShareCommands({
    session,
    isShareLanguagePinned: resolvedLanguage.isPinned,
    shareLanguage,
  });

  return {
    isShareDialogOpen,
    title: meeting?.bar.title ?? "",
    referenceLine,
    rows: dialogRows,
    text,
    shareLanguage,
    isShareLanguagePinned: resolvedLanguage.isPinned,
    shareZoneLabelParts: preferences.shareZoneLabelParts,
    destinations: destinations
      .filter((destination) => destination.isAvailable())
      .map(
        ({ id }): MeetingShareDestinationButton => ({
          id,
          label: presentShareDestinationLabel(id, t),
        }),
      ),
    closeShareDialog,
    toggleLocation: session.toggleLocation,
    chooseShareLanguage,
    toggleShareLanguagePin,
    toggleShareZoneLabelPart,
    share,
  };
}
