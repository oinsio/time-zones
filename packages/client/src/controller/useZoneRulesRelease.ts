import { useTranslation } from "react-i18next";
import { getInstalledRelease } from "@/lib/zoneRules";
import { presentZoneRulesRelease } from "@/presenter";

/**
 * The zone rules release line of the settings page, or `undefined` when no
 * release is active.
 * Implements FR8 of add-remote-zone-rules-updates (D6).
 */
export function useZoneRulesRelease(): string | undefined {
  const { t } = useTranslation();
  const release = getInstalledRelease()?.release;
  return release === undefined
    ? undefined
    : presentZoneRulesRelease(release, t);
}
