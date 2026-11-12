import zoneRulesUrl from "virtual:zone-rules-url";
import { bootApp, loadLegacySupport, needsLegacySupport } from "@/lib/legacy";
import { loadZoneRules } from "@/lib/zoneRules";

/**
 * Entry point: installs legacy support when the engine needs it, loads the
 * zone rules (the wrapper over `Intl.DateTimeFormat` is installed), then starts
 * the app, so nothing loads Temporal before the wrapper is in place.
 * Implements FR2 of support-legacy-ios-12-safari (D2), FR10 of add-zone-rules-from-iana (D3).
 */
void bootApp({
  needsLegacySupport,
  loadLegacySupport,
  loadZoneRules: () => loadZoneRules(zoneRulesUrl),
  loadApp: () => import("./main"),
});
