/**
 * The instant the running build was made, fixed into the build by Vite's
 * `define` (Vitest gets `TEST_DEPLOY_INSTANT`).
 * Implements FR6 of polish-settings-and-remove-offline-update-notice (D1).
 */
export const APP_DEPLOY_INSTANT: string = __APP_DEPLOY_INSTANT__;
