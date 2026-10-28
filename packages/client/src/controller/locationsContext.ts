import { createContext } from "react";
import type { Clock } from "@/lib/temporal";
import type {
  LocationCommand,
  LocationErrorCode,
  LocationsReduceResult,
  Store,
  WorldClockState,
} from "@/model";

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

export type LocationsContextValue = {
  store: Store<WorldClockState, LocationCommand, LocationErrorCode>;
  clock: Clock;
  /** Counts minute ticks; re-presents the rows. Implements FR3 of show-local-time-and-date-on-location-cards (D4). */
  minuteTick: number;
  loadStatus: LocationsStatus;
  hasSaveFailed: boolean;
  addLocation: (input: AddLocationInput) => LocationsReduceResult;
  removeLocation: (id: string) => LocationsReduceResult;
  /** Implements FR2 of reorder-locations-by-drag-and-drop. */
  moveLocation: (id: string, targetIndex: number) => LocationsReduceResult;
  resetLocations: () => void;
};

export const LocationsContext = createContext<LocationsContextValue | null>(
  null,
);
