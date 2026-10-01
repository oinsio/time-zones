import { createContext } from "react";
import type { Clock } from "@/lib/temporal";
import type {
  LocationCommand,
  LocationErrorCode,
  LocationsReduceResult,
  LocationsState,
  Store,
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
  store: Store<LocationsState, LocationCommand, LocationErrorCode>;
  clock: Clock;
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
