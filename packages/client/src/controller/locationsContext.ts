import { createContext } from "react";
import type { Clock } from "@/lib/temporal";
import type {
  LocationCommand,
  LocationErrorCode,
  LocationsReduceResult,
  Store,
  WorldClockState,
} from "@/model";
import type { LoadCitySearch } from "@/ports";

/** Whether the stored list could be read. Implements FR12 of add-locations-via-search (D5). */
export enum LocationsStatus {
  READY = "READY",
  UNREADABLE = "UNREADABLE",
}

export type AddLocationInput = {
  timeZoneId: string;
  label: string;
  countryCode: string;
};

export type WorldClockStore = Store<
  WorldClockState,
  LocationCommand,
  LocationErrorCode
>;

export type LocationsContextValue = {
  store: WorldClockStore;
  clock: Clock;
  /** Counts minute ticks; re-presents the rows. Implements FR3 of show-local-time-and-date-on-location-cards (D4). */
  minuteTick: number;
  loadStatus: LocationsStatus;
  /** Loads the city data once for the Here entry and the search. Implements FR8 of show-here-entry-for-device-time (D4). */
  loadCitySearch: LoadCitySearch;
  hasSaveFailed: boolean;
  addLocation: (input: AddLocationInput) => LocationsReduceResult;
  /** Appends the device time location; fails when it is listed (FR11). */
  addDeviceTimeLocation: () => LocationsReduceResult;
  removeLocation: (id: string) => LocationsReduceResult;
  /** Implements FR2 of reorder-locations-by-drag-and-drop. */
  moveLocation: (id: string, targetIndex: number) => LocationsReduceResult;
  /** `null` clears home. Implements FR3 of set-home-location-and-show-differences. */
  setHomeLocation: (id: string | null) => LocationsReduceResult;
  resetLocations: () => void;
};

export const LocationsContext = createContext<LocationsContextValue | null>(
  null,
);
