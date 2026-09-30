import { createContext } from "react";
import type {
  LocationCommand,
  LocationErrorCode,
  LocationsReduceResult,
  LocationsState,
  Store,
} from "@/model";

/** Whether the stored list could be read (D5). */
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
  loadStatus: LocationsStatus;
  hasSaveFailed: boolean;
  addLocation: (input: AddLocationInput) => LocationsReduceResult;
  removeLocation: (id: string) => LocationsReduceResult;
  resetLocations: () => void;
};

export const LocationsContext = createContext<LocationsContextValue | null>(
  null,
);
