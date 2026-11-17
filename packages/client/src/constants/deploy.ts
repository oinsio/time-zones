/**
 * The instant the running build was made, fixed into the build by Vite's
 * `define` (Vitest gets `TEST_DEPLOY_INSTANT`).
 * Implements FR6 of polish-settings-and-remove-offline-update-notice (D1).
 */
export const APP_DEPLOY_INSTANT: string = __APP_DEPLOY_INSTANT__;

/**
 * The app revision of the running build, fixed into the build by Vite's
 * `define` (Vitest gets `TEST_APP_REVISION`).
 * Implements FR1 of apply-data-updates-silently (D1).
 */
export const APP_REVISION: string = __APP_REVISION__;

/**
 * The dump date of the city data the app was built with, an ISO date fixed
 * into the build by Vite's `define` (Vitest gets `TEST_CITY_DATA_DATE`).
 * Implements FR12 of apply-data-updates-silently (D6).
 */
export const CITY_DATA_DATE: string = __CITY_DATA_DATE__;
