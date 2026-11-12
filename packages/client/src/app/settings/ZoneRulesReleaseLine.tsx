import { SETTINGS_FOOTNOTE_CLASS_NAME } from "@/constants";
import { useZoneRulesRelease } from "@/controller";

/**
 * The zone rules release line after the deploy time, in the accent colour of the deploy time. It is
 * plain text: no focus stop, no role, no live region; nothing without an
 * active release.
 * Implements FR8, NFR-A1, UX3 of add-remote-zone-rules-updates (D6).
 */
export function ZoneRulesReleaseLine() {
  const zoneRulesRelease = useZoneRulesRelease();
  if (zoneRulesRelease === undefined) return null;
  return (
    <p data-zone-rules-release className={SETTINGS_FOOTNOTE_CLASS_NAME}>
      {zoneRulesRelease}
    </p>
  );
}
