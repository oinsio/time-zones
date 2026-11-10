// Supports FR4 of fix-grid-meeting-range-lock-and-layering: the shared setup of the useMeetingRange tests.
import { renderHook } from "@testing-library/react";

import { type ReactNode, useContext } from "react";
import { vi } from "vitest";
import { createInMemoryLocationRepository } from "@/adapters";
import { LocationsProvider } from "@/controller";
import { LocationsLoadStatus } from "@/ports";
import { buildLocation, KNOWN_CITIES } from "@/test/factories/buildLocation";
import { createSwitchableClock } from "@/test/switchableClock";
import { createManualTickScheduler } from "@/test/tickSchedulers";
import { createManualWriteScheduler } from "@/test/writeSchedulers";
import { LocationsContext } from "./locationsContext";
import { useMeetingRange } from "./useMeetingRange";

export const cityRow = (label: string) =>
  buildLocation({ label, ...KNOWN_CITIES[label] });
export const almaty = cityRow("Almaty");

export function setup(extraLocations: ReturnType<typeof cityRow>[] = []) {
  const clock = createSwitchableClock("2026-03-08T07:30:00Z", "Asia/Almaty");
  const repository = createInMemoryLocationRepository({
    initialDocument: {
      status: LocationsLoadStatus.LOADED,
      locations: [
        almaty,
        cityRow("Moscow"),
        cityRow("New York"),
        ...extraLocations,
      ],
      homeLocationId: almaty.id,
    },
  });
  const save = vi.spyOn(repository, "save");
  const rendered = renderHook(
    () => ({
      ...useMeetingRange(),
      store: useContext(LocationsContext)?.store,
    }),
    {
      wrapper: ({ children }: { children: ReactNode }) => (
        <LocationsProvider
          repository={repository}
          writeScheduler={createManualWriteScheduler()}
          clock={clock}
          tickScheduler={createManualTickScheduler()}
        >
          {children}
        </LocationsProvider>
      ),
    },
  );
  const span = () => {
    const { meeting } = rendered.result.current;
    return meeting && [meeting.span.startMinutes, meeting.span.endMinutes];
  };
  return { ...rendered, save, span };
}
