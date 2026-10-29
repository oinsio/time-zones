import { bootApp, loadLegacySupport, needsLegacySupport } from "@/lib/legacy";

/**
 * Entry point: installs legacy support when the engine needs it, then starts
 * the app. Static imports stay inside `@/lib/legacy`, so nothing evaluates
 * temporal-polyfill before the zone shim.
 * Implements FR2 of support-legacy-ios-12-safari (D2).
 */
void bootApp({
  needsLegacySupport,
  loadLegacySupport,
  loadApp: () => import("./main"),
});
