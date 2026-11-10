// Supports FR1 of add-grid-meeting-range-and-share.
import { renderHook } from "@testing-library/react/pure";
import { createElement, type ReactNode } from "react";
import {
  createInMemoryLocationBackend,
  createInMemoryLocationRepository,
} from "@/adapters";
import { LocationsProvider, useLocations, useMeetingRange } from "@/controller";
import { createSwitchableClock } from "@/test/switchableClock";
import { createManualTickScheduler } from "@/test/tickSchedulers";
import { immediateWriteScheduler } from "@/test/writeSchedulers";
import { ALMATY_ZONE, SAMPLE_NOW } from "./meetingRangeWorld";

/** An app on one in-memory backend that can be opened again after it was closed. */
export const createStoredListApp = () => {
  const backend = createInMemoryLocationBackend();
  const renderApp = () =>
    renderHook(
      () => ({ meeting: useMeetingRange(), locations: useLocations() }),
      {
        wrapper: ({ children }: { children?: ReactNode }) =>
          createElement(
            LocationsProvider,
            {
              repository: createInMemoryLocationRepository({ backend }),
              writeScheduler: immediateWriteScheduler,
              clock: createSwitchableClock(SAMPLE_NOW, ALMATY_ZONE),
              tickScheduler: createManualTickScheduler(),
            },
            children,
          ),
      },
    );
  return { backend, renderApp };
};
