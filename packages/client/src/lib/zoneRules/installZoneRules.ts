/**
 * Installs the zone rules wrapper as the global `Intl.DateTimeFormat` and
 * reads what is installed: the release and the ids of the zones it knows.
 * Implements FR1, FR5, FR6 of add-zone-rules-from-iana (design D5, D6).
 */

import type { ZoneRulesRelease } from "./core/index.ts";
import { createZoneRulesDateTimeFormat } from "./dateTimeFormatWrapper.ts";

let installedRelease: ZoneRulesRelease | undefined;
let knownZoneIds: readonly string[] | undefined;

/** Wraps the current global `Intl.DateTimeFormat`; call it once per boot, before Temporal loads. */
export function installZoneRulesDateTimeFormat(
  release: ZoneRulesRelease,
): void {
  Intl.DateTimeFormat = createZoneRulesDateTimeFormat(
    Intl.DateTimeFormat,
    release,
  );
  installedRelease = release;
  knownZoneIds = undefined;
}

export function getInstalledRelease(): ZoneRulesRelease | undefined {
  return installedRelease;
}

/** The ids of every zone of the installed release, or `undefined` when none is installed. */
export function getKnownZoneIds(): readonly string[] | undefined {
  if (installedRelease === undefined) return undefined;
  knownZoneIds ??= [...installedRelease.zones.keys()];
  return knownZoneIds;
}
