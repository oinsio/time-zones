// Test harness of the useMeetingShare specs. Implements FR1 of add-meeting-share-dialog.
import zoneCities from "virtual:zone-cities";
import { act, renderHook } from "@testing-library/react";
import type { ReactNode } from "react";
import {
  createCompositeCitySearch,
  createInMemoryLocationRepository,
  createInMemoryPreferencesRepository,
  createInMemoryTextSharing,
  type InMemoryTextSharingOptions,
} from "@/adapters";
import { LocationsProvider, PreferencesProvider } from "@/controller";
import type { Location } from "@/model";
import {
  LocationsLoadStatus,
  PreferencesLoadStatus,
  ShareDestinationId,
} from "@/ports";
import { DEFAULT_PREFERENCES, type Preferences } from "@/preferences";
import { buildLocation, KNOWN_CITIES } from "@/test/factories/buildLocation";
import { createSwitchableClock } from "@/test/switchableClock";
import { createManualTickScheduler } from "@/test/tickSchedulers";
import { createManualWriteScheduler } from "@/test/writeSchedulers";
import { useMeetingRange } from "./useMeetingRange";
import { useMeetingShare } from "./useMeetingShare";
import { useMeetingShareDialog } from "./useMeetingShareDialog";

/** The light hook of the app shell with the session of the lazy dialog on top of it. */
export function useShare(
  textSharing: ReturnType<typeof createInMemoryTextSharing>,
  onMeetingShared?: () => void,
) {
  const shareMeeting = useMeetingShare(textSharing, onMeetingShared);
  return {
    ...shareMeeting,
    ...useMeetingShareDialog(shareMeeting),
  };
}

export const citySearch = createCompositeCitySearch(zoneCities);
export const loadCitySearch = async () => citySearch;

export const cityRow = (label: string) =>
  buildLocation({ label, ...KNOWN_CITIES[label] });
export const almaty = cityRow("Almaty");
export const moscow = cityRow("Moscow");
export const kolkata = cityRow("Kolkata");
export const newYork = cityRow("New York");

export const ENGLISH_SAMPLE_LINES = [
  "Meeting on Sunday, March 8, 2026, 2 h",
  "Almaty (UTC+5): 09:00–11:00",
  "Moscow (MSK, UTC+3): 07:00–09:00",
  "New York (EST, UTC−5): 23:00–01:00 (a day earlier, Sat, Mar 7)",
];

export type SetupOptions = {
  sharing?: InMemoryTextSharingOptions;
  locations?: readonly Location[];
  homeLocationId?: string | null;
  preferences?: Partial<Preferences>;
  /** Called when a share ends with the outcome shared. */
  onMeetingShared?: () => void;
};

export function setup({
  sharing = { canShare: true, canCopy: true },
  locations = [almaty, moscow, newYork],
  homeLocationId = almaty.id,
  preferences = {},
  onMeetingShared,
}: SetupOptions = {}) {
  const textSharing = createInMemoryTextSharing(sharing);
  const clock = createSwitchableClock("2026-03-08T07:30:00Z", "Asia/Almaty");
  const locationRepository = createInMemoryLocationRepository({
    initialDocument: {
      status: LocationsLoadStatus.LOADED,
      locations,
      homeLocationId,
    },
  });
  const preferencesRepository = createInMemoryPreferencesRepository({
    initialDocument: {
      status: PreferencesLoadStatus.LOADED,
      preferences: { ...DEFAULT_PREFERENCES, ...preferences },
    },
  });
  const rendered = renderHook(
    () => ({
      range: useMeetingRange(),
      share: useShare(textSharing, onMeetingShared),
    }),
    {
      wrapper: ({ children }: { children: ReactNode }) => (
        <PreferencesProvider
          repository={preferencesRepository}
          writeScheduler={createManualWriteScheduler()}
        >
          <LocationsProvider
            repository={locationRepository}
            writeScheduler={createManualWriteScheduler()}
            clock={clock}
            loadCitySearch={loadCitySearch}
            tickScheduler={createManualTickScheduler()}
          >
            {children}
          </LocationsProvider>
        </PreferencesProvider>
      ),
    },
  );
  act(() => rendered.result.current.range.selectCells(9, 10));
  return { ...rendered, textSharing, preferencesRepository };
}

export type Harness = ReturnType<typeof setup>["result"];
export const openDialog = (result: Harness) =>
  act(() => result.current.share.openShareDialog());
export const shareText = (result: Harness) =>
  act(() => result.current.share.share(ShareDestinationId.TEXT));
