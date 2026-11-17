import { useEffect, useMemo, useRef, useState } from "react";
import type { Clock } from "@/lib/temporal";
import {
  findChangedZones,
  getInstalledRelease,
  isNewerRelease,
  MILLISECONDS_PER_SECOND,
  parseZoneRulesRelease,
  type ZoneRulesRelease,
  ZoneRulesReleaseError,
} from "@/lib/zoneRules";
import {
  isZoneRulesSourceFailure,
  SaveOutcome,
  StoredReleaseLoadStatus,
  type StoredReleaseRepository,
  type ZoneRulesVersionSource,
} from "@/ports";
import { useRecheckOnReturn } from "./useRecheckOnReturn";

const WATCHED_ZONES_KEY_SEPARATOR = "\n";

export type ZoneRulesUpdateOptions = {
  clock: Clock;
  versionSource: ZoneRulesVersionSource;
  /** The zones the user can see; a stored release raises the notice only when it changes one. */
  watchedZoneIds: readonly string[];
  storedReleases: StoredReleaseRepository;
  isOnline?: () => boolean;
  getActiveRelease?: () => ZoneRulesRelease | undefined;
};

export type ZoneRulesUpdate = {
  /** The stored release that Reload will use, once it is not dismissed. */
  readyRelease: string | undefined;
  /** Hides the notice until a newer release is stored. */
  dismiss: () => void;
};

/**
 * The zone rules update check: at mount and on every update recheck it reads
 * the version file and, for a release newer than the active one, downloads,
 * validates and stores it, then reports it as ready. Every failure is silent.
 * A release whose save failed is not downloaded again for the page's life.
 * Implements FR3, FR4, FR7, FR9, NFR-P1 of add-remote-zone-rules-updates (design D4).
 * Implements FR8, FR9, FR10, NFR-P2, UX3 of apply-data-updates-silently (D5): the stored
 * release is reported only when it changes a watched zone, compared again only
 * when the stored release or the watched zones change.
 */
export function useZoneRulesUpdate({
  clock,
  versionSource,
  watchedZoneIds,
  storedReleases,
  isOnline = () => navigator.onLine,
  getActiveRelease = getInstalledRelease,
}: ZoneRulesUpdateOptions): ZoneRulesUpdate {
  const [storedRelease, setStoredRelease] = useState<string>();
  const storedParsedRelease = useRef<ZoneRulesRelease>();
  const [dismissedRelease, setDismissedRelease] = useState<string>();
  const unstoredRelease = useRef<string>();

  const check = async () => {
    const activeRelease = getActiveRelease();
    if (activeRelease === undefined || !isOnline()) return;
    const publishedVersion = await versionSource.fetchVersion();
    if (isZoneRulesSourceFailure(publishedVersion)) return;
    const publishedRelease = publishedVersion.release;
    if (!isNewerRelease(publishedRelease, activeRelease.release)) return;
    const storedLoadResult = storedReleases.load();
    if (
      storedLoadResult.status === StoredReleaseLoadStatus.LOADED &&
      !isNewerRelease(publishedRelease, storedLoadResult.release.release)
    ) {
      storedParsedRelease.current = storedLoadResult.release;
      setStoredRelease(storedLoadResult.release.release);
      return;
    }
    if (unstoredRelease.current === publishedRelease) return;
    const releaseDocument = await versionSource.fetchRelease(publishedRelease);
    const downloaded = parseZoneRulesRelease(releaseDocument);
    if (downloaded instanceof ZoneRulesReleaseError) return;
    if (downloaded.release !== publishedRelease) return;
    if (storedReleases.save(releaseDocument) === SaveOutcome.FAILED) {
      unstoredRelease.current = publishedRelease;
      return;
    }
    storedParsedRelease.current = downloaded;
    setStoredRelease(publishedRelease);
  };

  // biome-ignore lint/correctness/useExhaustiveDependencies: the start-up check runs once, at mount
  useEffect(() => {
    void check();
  }, []);

  useRecheckOnReturn({
    onRecheck: () => void check(),
    clock,
    isEnabled: true,
  });

  const watchedZonesKey = [...watchedZoneIds]
    .sort()
    .join(WATCHED_ZONES_KEY_SEPARATOR);
  // biome-ignore lint/correctness/useExhaustiveDependencies: compared only when the stored release or the watched zones change, never on a tick or a render
  const isStoredReleaseChangingWatchedZone = useMemo(() => {
    const activeRelease = getActiveRelease();
    const parsedRelease = storedParsedRelease.current;
    if (storedRelease === undefined || !activeRelease || !parsedRelease) {
      return false;
    }
    const epochSeconds = Math.floor(
      clock.instant().epochMilliseconds / MILLISECONDS_PER_SECOND,
    );
    return (
      findChangedZones(
        activeRelease,
        parsedRelease,
        watchedZoneIds,
        epochSeconds,
      ).length > 0
    );
  }, [storedRelease, watchedZonesKey]);

  return {
    readyRelease:
      storedRelease === dismissedRelease || !isStoredReleaseChangingWatchedZone
        ? undefined
        : storedRelease,
    dismiss: () => setDismissedRelease(storedRelease),
  };
}
