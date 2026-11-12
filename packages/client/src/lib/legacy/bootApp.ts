export type BootAppSteps = {
  needsLegacySupport: () => boolean;
  loadLegacySupport: () => Promise<unknown>;
  loadZoneRules: () => Promise<unknown>;
  loadApp: () => Promise<unknown>;
};

/**
 * Starts the app: loads legacy support first when the engine needs it, then
 * the zone rules, then the app. A failed legacy or rules load still loads the
 * app, so the user sees the app or its recovery screen, never a blank page.
 * Implements FR2 of support-legacy-ios-12-safari (D2) and FR10 of
 * add-zone-rules-from-iana (D3).
 */
export async function bootApp(steps: BootAppSteps): Promise<void> {
  if (steps.needsLegacySupport()) {
    try {
      await steps.loadLegacySupport();
    } catch (legacySupportError) {
      // Fall through: the app starts without the polyfills.
      console.error(legacySupportError);
    }
  }
  try {
    await steps.loadZoneRules();
  } catch (zoneRulesError) {
    // Fall through: the app starts with the engine's own zone data.
    console.error(zoneRulesError);
  }
  await steps.loadApp();
}
