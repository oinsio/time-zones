/**
 * Set-up shared by the tests and scenarios of the zone rules update check: the
 * in-memory source and repository, a switchable clock and an injected active
 * release and online state.
 * Implements FR3, FR4, FR7, FR9 of add-remote-zone-rules-updates.
 */
import { act, renderHook } from "@testing-library/react";
import {
  createInMemoryStoredReleaseRepository,
  createInMemoryZoneRulesVersionSource,
  type InMemoryZoneRulesVersionSourceScript,
} from "@/adapters";
import { useZoneRulesUpdate } from "@/controller/useZoneRulesUpdate";
import type { ZoneRulesRelease } from "@/lib/zoneRules";
import type { StoredReleaseRepository } from "@/ports";
import { setPageVisibility } from "@/test/pageVisibility";
import { createSwitchableClock } from "@/test/switchableClock";
import { buildReleaseDocument } from "./buildReleaseDocument";

export const CHECK_START = "2026-03-08T07:30:00Z";
export const SIXTEEN_MINUTES_LATER = "2026-03-08T07:46:00Z";
export const FIVE_MINUTES_LATER = "2026-03-08T07:35:00Z";

export type ZoneRulesUpdateWorldOptions = {
  activeRelease?: string | null;
  script?: InMemoryZoneRulesVersionSourceScript;
  storedDocument?: unknown;
  isStorageWritable?: boolean;
  storedReleases?: StoredReleaseRepository;
  isOnline?: boolean;
};

export const releaseNamed = (release: string): ZoneRulesRelease => ({
  release,
  zones: new Map(),
});

/** A script whose version file names `release` and whose release file is valid. */
export const publishing = (release: string) => ({
  version: { release },
  releases: { [release]: buildReleaseDocument(release) },
});

export function createZoneRulesUpdateWorld({
  activeRelease = "2026f",
  script = {},
  storedDocument,
  isStorageWritable,
  storedReleases = createInMemoryStoredReleaseRepository({
    initialDocument: storedDocument,
    isWritable: isStorageWritable,
  }),
  isOnline = true,
}: ZoneRulesUpdateWorldOptions = {}) {
  const versionSource = createInMemoryZoneRulesVersionSource(script);
  const clock = createSwitchableClock(CHECK_START);
  const connection = { isOnline };
  const save = vi.spyOn(storedReleases, "save");
  const rendered = renderHook(() =>
    useZoneRulesUpdate({
      clock,
      versionSource,
      storedReleases,
      isOnline: () => connection.isOnline,
      getActiveRelease: () =>
        activeRelease === null ? undefined : releaseNamed(activeRelease),
    }),
  );
  const settle = () => act(async () => undefined);
  const returnToPage = async (instant: string) => {
    clock.moveTo(instant);
    act(() => setPageVisibility("visible"));
    await settle();
  };
  return {
    versionSource,
    storedReleases,
    save,
    connection,
    settle,
    returnToPage,
    ...rendered,
  };
}
