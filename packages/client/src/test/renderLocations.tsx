import { renderHook } from "@testing-library/react";
import type { ReactNode } from "react";
import type { WriteScheduler } from "@/controller";
import { LocationsProvider, useLocations } from "@/controller";
import type { LocationRepository } from "@/ports";
import { buildLocation } from "@/test/factories/buildLocation";
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
) =>
  renderHook(() => useLocations(), {
    wrapper: ({ children }: { children: ReactNode }) => (
      <LocationsProvider
        repository={repository}
        writeScheduler={writeScheduler}
      >
        {children}
      </LocationsProvider>
    ),
  });
