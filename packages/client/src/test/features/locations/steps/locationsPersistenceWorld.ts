// "pure" skips auto-cleanup: each step is its own test, the app must survive between steps.
import { act, renderHook } from "@testing-library/react/pure";
import { createElement, type ReactNode } from "react";
import {
  createLocalStorageLocationRepository,
  type LocationsSyncChannel,
} from "@/adapters";
import { LOCATIONS_SCHEMA_VERSION, STORAGE_KEYS } from "@/constants";
import { LocationsProvider, useLocations } from "@/controller";
import { isDeviceTimeLocation, LocationKind } from "@/model";
import { KNOWN_CITIES } from "@/test/factories/buildLocation";
import { createSwitchableClock } from "@/test/switchableClock";
import { immediateWriteScheduler } from "@/test/writeSchedulers";

const DOCUMENT_VERSION = 1;
const NEWER_DOCUMENT_VERSION = 99;
export const NOT_JSON = "{not json";
export const UNREADABLE_DOCUMENTS: Record<string, string> = {
  "not valid JSON": NOT_JSON,
  "written by a newer version": JSON.stringify({
    schemaVersion: NEWER_DOCUMENT_VERSION,
    payload: { locations: [] },
  }),
  'holding a location in "+05:00"': JSON.stringify({
    schemaVersion: DOCUMENT_VERSION,
    payload: {
      locations: [{ timeZoneId: "+05:00", label: "Nowhere", countryCode: "" }],
    },
  }),
  'holding a location with the country code "Kazakhstan"': JSON.stringify({
    schemaVersion: DOCUMENT_VERSION,
    payload: {
      locations: [
        {
          timeZoneId: "Asia/Almaty",
          label: "Almaty",
          countryCode: "Kazakhstan",
        },
      ],
    },
  }),
};

type StoredEntry = { timeZoneId: string; label: string; countryCode: string };

/** Stores a version 1 document, which a load migrates to put the device time location first. */
export const storeVersion1Document = (entries: StoredEntry[]) =>
  localStorage.setItem(
    STORAGE_KEYS.LOCATIONS,
    JSON.stringify({
      schemaVersion: DOCUMENT_VERSION,
      payload: { locations: entries },
    }),
  );

/** Stores a document of the current version that lists only the given cities. */
export const storeDocument = (
  entries: StoredEntry[],
  { hasDeviceTime = false }: { hasDeviceTime?: boolean } = {},
) =>
  localStorage.setItem(
    STORAGE_KEYS.LOCATIONS,
    JSON.stringify({
      schemaVersion: LOCATIONS_SCHEMA_VERSION,
      payload: {
        locations: [
          ...(hasDeviceTime ? [{ kind: LocationKind.DEVICE_TIME }] : []),
          ...entries.map((entry) => ({ kind: LocationKind.CITY, ...entry })),
        ],
        homeLocationId: null,
      },
    }),
  );
export const cityEntry = (label: string) => ({
  label,
  timeZoneId: KNOWN_CITIES[label]?.timeZoneId ?? "",
  countryCode: KNOWN_CITIES[label]?.countryCode ?? "",
});

const OPEN_INSTANT = "2026-03-08T07:30:00Z";

export type OpenedApp = ReturnType<typeof openApp>;

export function openApp(
  createChannel?: () => LocationsSyncChannel | undefined,
  deviceTimeZone?: string,
) {
  const repository = createLocalStorageLocationRepository({
    getStorage: () => localStorage,
    createChannel,
  });
  const clock =
    deviceTimeZone === undefined
      ? undefined
      : createSwitchableClock(OPEN_INSTANT, deviceTimeZone);
  return renderHook(() => useLocations(), {
    wrapper: ({ children }: { children: ReactNode }) =>
      createElement(
        LocationsProvider,
        { repository, writeScheduler: immediateWriteScheduler, clock },
        children,
      ),
  });
}
export const labelsOf = (app: OpenedApp) =>
  app.result.current.locations.map(({ label }) => label);
export const addCity = (app: OpenedApp, label: string) =>
  act(() => {
    app.result.current.addLocation(cityEntry(label));
  });

/** The device time location has no label, so a scenario names it by this phrase. */
export const DEVICE_TIME_NAME = "the device time location";
export const namesOf = (app: OpenedApp) =>
  app.result.current.locations.map((location) =>
    isDeviceTimeLocation(location) ? DEVICE_TIME_NAME : location.label,
  );
