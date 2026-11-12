/**
 * Boot step: fetches the zone rules release, reads it and installs the
 * wrapper. A failed request or an invalid document rejects and installs
 * nothing; `bootApp` then starts the app on the engine's own data.
 * Implements FR10 of add-zone-rules-from-iana (design D3).
 */
import { parseZoneRulesRelease, ZoneRulesReleaseError } from "./core/index.ts";
import { installZoneRulesDateTimeFormat } from "./installZoneRules.ts";

export async function loadZoneRules(
  releaseUrl: string,
  fetchRelease: typeof fetch = fetch,
): Promise<void> {
  const response = await fetchRelease(releaseUrl);
  if (!response.ok) {
    throw new Error(
      `Zone rules request failed: ${response.status} ${releaseUrl}`,
    );
  }
  const release = parseZoneRulesRelease(await response.json());
  if (release instanceof ZoneRulesReleaseError) throw release;
  installZoneRulesDateTimeFormat(release);
}
