export type BootAppSteps = {
  needsLegacySupport: () => boolean;
  loadLegacySupport: () => Promise<unknown>;
  loadApp: () => Promise<unknown>;
};

/**
 * Starts the app: loads legacy support first when the engine needs it, then
 * the app. A failed legacy load still loads the app, so the user sees the app
 * or its recovery screen, never a blank page.
 * Implements FR2 of support-legacy-ios-12-safari (D2).
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
  await steps.loadApp();
}
