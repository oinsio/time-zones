// Implements FR3, FR4 of add-meeting-share-dialog: the app of the meeting share steps.
import { act, renderHook } from "@testing-library/react/pure";
import { createElement, type ReactNode } from "react";
import {
  createInMemoryLocationRepository,
  createInMemoryPreferencesRepository,
  createInMemoryTextSharing,
  type InMemoryTextSharing,
  type InMemoryTextSharingOptions,
} from "@/adapters";
import {
  LocationsProvider,
  PreferencesProvider,
  useMeetingRange,
  useMeetingShare,
  useMeetingShareDialog,
} from "@/controller";
import {
  LocationsLoadStatus,
  PreferencesLoadStatus,
  ShareDestinationId,
} from "@/ports";
import { DEFAULT_PREFERENCES, type HourFormat } from "@/preferences";
import { buildLocation, KNOWN_CITIES } from "@/test/factories/buildLocation";
import { createSwitchableClock } from "@/test/switchableClock";
import { createManualTickScheduler } from "@/test/tickSchedulers";
import { immediateWriteScheduler } from "@/test/writeSchedulers";
import { ALMATY_ZONE, idOf, SAMPLE_NOW } from "./meetingRangeWorld";

/** The light hook of the app shell with the session of the lazy dialog on top of it. */
const useShareWithDialog = (textSharing: InMemoryTextSharing) => {
  const shareMeeting = useMeetingShare(textSharing);
  return { ...shareMeeting, ...useMeetingShareDialog(shareMeeting) };
};

export const CITIES = ["Almaty", "Moscow", "Kolkata", "New York"];

/** Renders the app with the sample list and a text sharing of the given abilities. */
export function renderShareApp(
  options: InMemoryTextSharingOptions,
  hourFormat: HourFormat,
) {
  const sharing = createInMemoryTextSharing(options);
  const rendered = renderHook(
    () => ({ range: useMeetingRange(), share: useShareWithDialog(sharing) }),
    {
      wrapper: ({ children }: { children?: ReactNode }) =>
        createElement(
          PreferencesProvider,
          {
            repository: createInMemoryPreferencesRepository({
              initialDocument: {
                status: PreferencesLoadStatus.LOADED,
                preferences: { ...DEFAULT_PREFERENCES, hourFormat },
              },
            }),
            writeScheduler: immediateWriteScheduler,
          },
          createElement(
            LocationsProvider,
            {
              repository: createInMemoryLocationRepository({
                initialDocument: {
                  status: LocationsLoadStatus.LOADED,
                  locations: CITIES.map((label) =>
                    buildLocation({ label, ...KNOWN_CITIES[label] }),
                  ),
                  homeLocationId: idOf("Almaty"),
                },
              }),
              writeScheduler: immediateWriteScheduler,
              clock: createSwitchableClock(SAMPLE_NOW, ALMATY_ZONE),
              tickScheduler: createManualTickScheduler(),
            },
            children,
          ),
        ),
    },
  );
  return { app: rendered, sharing };
}

/** Selects the sample range, opens the dialog and shares the text. */
export async function shareSampleRange(
  app: ReturnType<typeof renderShareApp>["app"],
) {
  act(() => app.result.current.range.selectCells(9, 10));
  act(() => app.result.current.share.openShareDialog());
  await act(() => app.result.current.share.share(ShareDestinationId.TEXT));
}
