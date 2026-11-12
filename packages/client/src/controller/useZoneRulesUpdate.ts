import { useEffect, useRef, useState } from "react";
import type { Clock } from "@/lib/temporal";
import {
  getInstalledRelease,
  isNewerRelease,
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

export type ZoneRulesUpdateOptions = {
  clock: Clock;
  versionSource: ZoneRulesVersionSource;
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
 */
export function useZoneRulesUpdate({
  clock,
  versionSource,
  storedReleases,
  isOnline = () => navigator.onLine,
  getActiveRelease = getInstalledRelease,
}: ZoneRulesUpdateOptions): ZoneRulesUpdate {
  const [storedRelease, setStoredRelease] = useState<string>();
  const [dismissedRelease, setDismissedRelease] = useState<string>();
  const unstoredRelease = useRef<string>();

  const check = async () => {
    const activeRelease = getActiveRelease();
    if (activeRelease === undefined || !isOnline()) return;
    const version = await versionSource.fetchVersion();
    if (isZoneRulesSourceFailure(version)) return;
    const name = version.release;
    if (!isNewerRelease(name, activeRelease.release)) return;
    const stored = storedReleases.load();
    if (
      stored.status === StoredReleaseLoadStatus.LOADED &&
      !isNewerRelease(name, stored.release.release)
    ) {
      setStoredRelease(stored.release.release);
      return;
    }
    if (unstoredRelease.current === name) return;
    const document = await versionSource.fetchRelease(name);
    const downloaded = parseZoneRulesRelease(document);
    if (downloaded instanceof ZoneRulesReleaseError) return;
    if (downloaded.release !== name) return;
    if (storedReleases.save(document) === SaveOutcome.FAILED) {
      unstoredRelease.current = name;
      return;
    }
    setStoredRelease(name);
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

  return {
    readyRelease:
      storedRelease === dismissedRelease ? undefined : storedRelease,
    dismiss: () => setDismissedRelease(storedRelease),
  };
}
