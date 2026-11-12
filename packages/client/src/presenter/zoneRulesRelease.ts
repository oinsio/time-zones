import type { TFunction } from "i18next";

/**
 * The zone rules release line: names the active release in the interface
 * language.
 * Implements FR8 of add-remote-zone-rules-updates (design D6).
 */
export function presentZoneRulesRelease(
  release: string,
  translate: TFunction,
): string {
  return translate("settings.zoneRulesRelease", { release });
}
