/**
 * Boot step: reads the stored release, fetches and reads the bundled release,
 * makes the newer one active and installs the wrapper. It rejects only when
 * nothing could be installed; `bootApp` then starts the app on the engine's
 * own data.
 * Implements FR10 of add-zone-rules-from-iana (design D3), FR6, NFR-P2 of
 * add-remote-zone-rules-updates (design D3).
 */
import type { StoredReleaseRepository } from "@/ports";
import { StoredReleaseLoadStatus } from "@/ports";
import { chooseActiveRelease } from "./activeRelease.ts";
import {
  parseZoneRulesRelease,
  type ZoneRulesRelease,
  ZoneRulesReleaseError,
} from "./core/index.ts";
import { installZoneRulesDateTimeFormat } from "./installZoneRules.ts";

export type LoadZoneRulesDependencies = {
  storedReleases: StoredReleaseRepository;
  fetchRelease?: typeof fetch;
};

async function fetchBundledRelease(
  releaseUrl: string,
  fetchRelease: typeof fetch,
): Promise<ZoneRulesRelease> {
  const response = await fetchRelease(releaseUrl);
  if (!response.ok) {
    throw new Error(
      `Zone rules request failed: ${response.status} ${releaseUrl}`,
    );
  }
  const release = parseZoneRulesRelease(await response.json());
  if (release instanceof ZoneRulesReleaseError) throw release;
  return release;
}

export async function loadZoneRules(
  releaseUrl: string,
  { storedReleases, fetchRelease = fetch }: LoadZoneRulesDependencies,
): Promise<void> {
  const storedResult = storedReleases.load();
  const stored =
    storedResult.status === StoredReleaseLoadStatus.LOADED
      ? storedResult.release
      : undefined;
  let bundled: ZoneRulesRelease | undefined;
  let bundledFailure: unknown;
  try {
    bundled = await fetchBundledRelease(releaseUrl, fetchRelease);
  } catch (failure) {
    bundledFailure = failure;
  }
  const { active, shouldClearStored } = chooseActiveRelease({
    bundled,
    stored,
  });
  if (
    shouldClearStored ||
    storedResult.status === StoredReleaseLoadStatus.UNREADABLE
  ) {
    storedReleases.clear();
  }
  if (active === undefined) throw bundledFailure;
  installZoneRulesDateTimeFormat(active);
}
