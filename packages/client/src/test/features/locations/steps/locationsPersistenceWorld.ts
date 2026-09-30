// "pure" skips auto-cleanup: each step is its own test, the app must survive between steps.
import { act, renderHook } from "@testing-library/react/pure";
import { createElement, type ReactNode } from "react";
import {
  createLocalStorageLocationRepository,
  type LocationsSyncChannel,
} from "@/adapters";
import { STORAGE_KEYS } from "@/constants";
import { LocationsProvider, useLocations } from "@/controller";
import { KNOWN_CITIES } from "@/test/factories/buildLocation";
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

export const storeDocument = (
  entries: { timeZoneId: string; label: string; countryCode: string }[],
) =>
  localStorage.setItem(
    STORAGE_KEYS.LOCATIONS,
    JSON.stringify({
      schemaVersion: DOCUMENT_VERSION,
      payload: { locations: entries },
    }),
  );
export const cityEntry = (label: string) => ({
  label,
  timeZoneId: KNOWN_CITIES[label]?.timeZoneId ?? "",
  countryCode: KNOWN_CITIES[label]?.countryCode ?? "",
});

export type OpenedApp = ReturnType<typeof openApp>;

export function openApp(
  createChannel?: () => LocationsSyncChannel | undefined,
) {
  const repository = createLocalStorageLocationRepository({
    getStorage: () => localStorage,
    createChannel,
  });
  return renderHook(() => useLocations(), {
    wrapper: ({ children }: { children: ReactNode }) =>
      createElement(
        LocationsProvider,
        { repository, writeScheduler: immediateWriteScheduler },
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
