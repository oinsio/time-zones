// Implements FR3, FR5, FR6, FR13 of show-zone-abbreviations-and-zone-label-setting: rows and the settings page over the real providers.
import { act, cleanup, render, screen } from "@testing-library/react/pure";
import userEvent from "@testing-library/user-event";
import i18n from "i18next";
import { useState } from "react";
import {
  createInMemoryLocationRepository,
  createInMemoryPreferencesRepository,
} from "@/adapters";
import { SettingsPage } from "@/app/settings";
import {
  LocationsProvider,
  PreferencesProvider,
  useLocations,
  useReferenceMoment,
} from "@/controller";
import { buildDeviceTimeLocation } from "@/model";
import { LocationsLoadStatus, PreferencesLoadStatus } from "@/ports";
import { DEFAULT_PREFERENCES, ZoneLabelPart } from "@/preferences";
import { buildLocation } from "@/test/factories/buildLocation";
import { ignoreWallTime } from "@/test/ignoreWallTime";
import { createSwitchableClock } from "@/test/switchableClock";
import { createManualTickScheduler } from "@/test/tickSchedulers";
import {
  createManualWriteScheduler,
  immediateWriteScheduler,
} from "@/test/writeSchedulers";
import { LocationList } from "@/views/shared";
import { DEVICE_TIME_LIST_TOKEN } from "./deviceTimeQueries";
import { cityEntry } from "./locationsUiWorld";
import { readZoneLineElements } from "./zoneLineQueries";

const DEFAULT_INSTANT = "2026-07-15T12:00:00Z";
const DEFAULT_DEVICE_ZONE = "UTC";
const LIST_SEPARATOR = /, | and /;

export const ZONE_LABEL_PART_NAMES = {
  "the UTC offset and the zone abbreviation": [
    ZoneLabelPart.UTC_OFFSET,
    ZoneLabelPart.ZONE_ABBREVIATION,
  ],
  "the UTC offset only": [ZoneLabelPart.UTC_OFFSET],
  "the zone abbreviation only": [ZoneLabelPart.ZONE_ABBREVIATION],
  nothing: [],
} as const;

type ReferenceHandle = ReturnType<typeof useReferenceMoment>;

/**
 * Per-scenario state of the zone line features: the list, the clock and the
 * zone label over the real providers, with the list page and the settings
 * page one click apart.
 */
export const createZoneLineWorld = () => {
  let clock = createSwitchableClock(DEFAULT_INSTANT, DEFAULT_DEVICE_ZONE);
  let zoneLabelParts: readonly ZoneLabelPart[] =
    DEFAULT_PREFERENCES.zoneLabelParts;
  let cityLabels: string[] = [];
  let hasDeviceTimeLocation = false;
  let latestReference: ReferenceHandle;
  let showSettingsPage: (isShown: boolean) => void = () => undefined;

  const Shell = () => {
    const [isSettingsShown, setIsSettingsShown] = useState(false);
    showSettingsPage = setIsSettingsShown;
    const locations = useLocations();
    latestReference = useReferenceMoment();
    return isSettingsShown ? (
      <SettingsPage notices={null} onBack={() => setIsSettingsShown(false)} />
    ) : (
      <LocationList
        rows={locations.rows}
        onRemove={locations.removeLocation}
        onSetHome={locations.setHomeLocation}
        onMove={locations.moveLocation}
        onSelectTrackFraction={() => undefined}
        onMoveTrack={() => undefined}
        onConfirmWallTime={ignoreWallTime}
      />
    );
  };

  const rowOf = (city: string) =>
    screen
      .getAllByRole("listitem")
      .find((row) => row.textContent?.includes(city)) as HTMLElement;

  return {
    reset: async () => {
      cleanup();
      clock = createSwitchableClock(DEFAULT_INSTANT, DEFAULT_DEVICE_ZONE);
      zoneLabelParts = DEFAULT_PREFERENCES.zoneLabelParts;
      cityLabels = [];
      hasDeviceTimeLocation = false;
      await i18n.changeLanguage("en");
    },
    finish: async () => {
      cleanup();
      await i18n.changeLanguage("ru");
    },
    setInstant: (timestamp: string) =>
      clock.moveTo(timestamp, clock.timeZoneId()),
    setDeviceZone: (zone: string) =>
      clock.moveTo(clock.instant().toString(), zone),
    setLanguage: (language: string) => i18n.changeLanguage(language),
    setZoneLabel: (partsName: keyof typeof ZONE_LABEL_PART_NAMES) => {
      zoneLabelParts = ZONE_LABEL_PART_NAMES[partsName];
    },
    setList: (listText: string) => {
      const entries = listText.split(LIST_SEPARATOR);
      hasDeviceTimeLocation = entries.includes(DEVICE_TIME_LIST_TOKEN);
      cityLabels = entries.filter((entry) => entry !== DEVICE_TIME_LIST_TOKEN);
    },
    open: () => {
      const locations = [
        ...(hasDeviceTimeLocation
          ? [buildDeviceTimeLocation(clock.timeZoneId())]
          : []),
        ...cityLabels.map((label) => buildLocation(cityEntry(label))),
      ];
      render(
        <PreferencesProvider
          repository={createInMemoryPreferencesRepository({
            initialDocument: {
              status: PreferencesLoadStatus.LOADED,
              preferences: { ...DEFAULT_PREFERENCES, zoneLabelParts },
            },
          })}
          writeScheduler={createManualWriteScheduler()}
        >
          <LocationsProvider
            repository={createInMemoryLocationRepository({
              initialDocument: {
                status: LocationsLoadStatus.LOADED,
                locations,
                homeLocationId: null,
              },
            })}
            writeScheduler={immediateWriteScheduler}
            clock={clock}
            tickScheduler={createManualTickScheduler()}
          >
            <Shell />
          </LocationsProvider>
        </PreferencesProvider>,
      );
    },
    pinMoment: (isoDate: string) =>
      act(() => latestReference.selectDate(isoDate)),
    /** Turns a zone label toggle in the settings page and returns to the list. */
    toggleInSettings: async (toggleName: string) => {
      act(() => showSettingsPage(true));
      await userEvent.click(screen.getByRole("button", { name: toggleName }));
      await userEvent.click(
        screen.getByRole("button", { name: i18n.t("settings.back") }),
      );
    },
    rowOf,
    zoneLineOf: (city: string) => readZoneLineElements(rowOf(city)),
    deviceTimeRowOf: () => rowOf(i18n.t("locations.deviceTimeMeta")),
  };
};
