import { renderHook } from "@testing-library/react";
import type { ReactNode } from "react";
import type { TickScheduler, WriteScheduler } from "@/controller";
import { LocationsProvider, useLocations } from "@/controller";
import type { Clock } from "@/lib/temporal";
import {
  type LocationRepository,
  type LocationsLoadResult,
  LocationsLoadStatus,
} from "@/ports";
import { buildLocation } from "@/test/factories/buildLocation";
import { createManualTickScheduler } from "@/test/tickSchedulers";
import { immediateWriteScheduler } from "@/test/writeSchedulers";

export const moscow = buildLocation();
export const almaty = buildLocation({
  timeZoneId: "Asia/Almaty",
  label: "Almaty",
  countryCode: "KZ",
});
export const moscowInput = {
  timeZoneId: "Europe/Moscow",
  label: "Moscow",
  countryCode: "RU",
};

export const renderLocations = (
  repository: LocationRepository,
  writeScheduler: WriteScheduler = immediateWriteScheduler,
  clock?: Clock,
  tickScheduler: TickScheduler = createManualTickScheduler(),
) =>
  renderHook(() => useLocations(), {
    wrapper: ({ children }: { children: ReactNode }) => (
      <LocationsProvider
        repository={repository}
        writeScheduler={writeScheduler}
        clock={clock}
        tickScheduler={tickScheduler}
      >
        {children}
      </LocationsProvider>
    ),
  });

/** A stored list the user emptied: it stays empty, unlike a missing document. */
export const storedEmptyList: LocationsLoadResult = {
  status: LocationsLoadStatus.LOADED,
  locations: [],
  homeLocationId: null,
};
