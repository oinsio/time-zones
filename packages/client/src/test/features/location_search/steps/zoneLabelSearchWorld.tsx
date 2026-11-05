// Implements FR15 of show-zone-abbreviations-and-zone-label-setting: the search over a stored zone label.
import { renderHook, waitFor } from "@testing-library/react/pure";
import type { ReactNode } from "react";
import { expect } from "vitest";
import { createInMemoryPreferencesRepository } from "@/adapters";
import { PreferencesProvider, useCitySearch } from "@/controller";
import { PreferencesLoadStatus } from "@/ports";
import { DEFAULT_PREFERENCES, type ZoneLabelPart } from "@/preferences";
import { createManualWriteScheduler } from "@/test/writeSchedulers";
import { buildCitySearch } from "./searchWorld";

/** The presented results of a query under the given zone label parts. */
export async function searchWithZoneLabel(
  query: string,
  zoneLabelParts: readonly ZoneLabelPart[],
) {
  const { result } = renderHook(
    () => useCitySearch(() => Promise.resolve(buildCitySearch())),
    {
      wrapper: ({ children }: { children: ReactNode }) => (
        <PreferencesProvider
          repository={createInMemoryPreferencesRepository({
            initialDocument: {
              status: PreferencesLoadStatus.LOADED,
              preferences: { ...DEFAULT_PREFERENCES, zoneLabelParts },
            },
          })}
          writeScheduler={createManualWriteScheduler()}
        >
          {children}
        </PreferencesProvider>
      ),
    },
  );
  await waitFor(() =>
    expect(result.current.presentResults(query, []).length).toBeGreaterThan(0),
  );
  return result.current.presentResults(query, []);
}
