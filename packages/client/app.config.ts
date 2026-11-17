/**
 * Build-time application settings shared by Vite, the PWA manifest and E2E tests.
 * Implements FR1, FR3 of setup-app-shell-and-pages-deploy.
 */
export const APP_BASE_PATH = "/time-zones/";

export const APP_NAME = "Time Zones";
export const APP_SHORT_NAME = "Time Zones";

export const APP_THEME_COLOR = "#2F5BD3";
/** Mirrors the light background token in src/styles/tokens.css. */
export const APP_LIGHT_BACKGROUND_COLOR = "#F7F7F5";

export const BUILD_OUT_DIR = "dist";

export const APP_ICON_SOURCE_DIR = "assets";
export const APP_ICON_SOURCE_PATH = `${APP_ICON_SOURCE_DIR}/app-icon-source.png`;
/** White margin around the logo on the opaque (maskable and Apple) icons. */
export const APP_ICON_BACKGROUND_COLOR = "#FFFFFF";
/**
 * Share of the maskable icon kept free around the logo: the logo spans 85%, so
 * the map content stays inside the 80% safe-zone circle of any launcher mask.
 */
export const MASKABLE_ICON_PADDING = 0.15;
/** iOS only rounds the corners, so the Apple touch icon needs a thin margin. */
export const APPLE_ICON_PADDING = 0.08;

/** Port of the production preview server that the E2E tests run against. */
export const E2E_PORT = 4173;

/**
 * Syntax level of the production build and its CSS: the esbuild default with
 * Safari 12 (iOS 12.5) in place of Safari 14. Implements FR1, FR12 of
 * support-legacy-ios-12-safari (D1, D7).
 */
export const BUILD_TARGETS = [
  "es2020",
  "edge88",
  "firefox78",
  "chrome87",
  "safari12",
  "ios12",
];

/**
 * Name of the global that Vite's `define` replaces with the deploy instant.
 * Implements FR6 of polish-settings-and-remove-offline-update-notice (D1).
 */
export const DEPLOY_INSTANT_DEFINE = "__APP_DEPLOY_INSTANT__";

/** The deploy instant of every Vitest run, so that tests do not depend on the build. */
export const TEST_DEPLOY_INSTANT = "2026-03-08T07:30:00.000Z";

/**
 * Name of the global that Vite's `define` replaces with the app revision.
 * Implements FR1 of apply-data-updates-silently (D1).
 */
export const APP_REVISION_DEFINE = "__APP_REVISION__";

/** The app revision of every Vitest run, so that tests do not depend on git. */
export const TEST_APP_REVISION = "test-app-revision";

export { APP_REVISION_FILE } from "./src/constants/appRevisionFile.ts";

/**
 * Gzipped size ceiling of the zone rules asset, in KB: the committed release
 * measures 18 204 bytes gzipped (17.8 KB); plus 20 %, rounded up.
 * Implements NFR-P1 of add-zone-rules-from-iana (D2).
 */
export const ZONE_RULES_ASSET_BUDGET_KB = 22;

/**
 * Gzipped size ceiling of the search data file (the zone cities and the GeoNames
 * city data), in KB, measured by `check-bundle-size.mjs`.
 * Implements NFR-P1, M2 of add-geonames-city-source (D1).
 * Implements NFR-P1 of add-city-coordinates-to-locations (D8): 150 KB with the coordinates of every city.
 */
export const CITY_SEARCH_DATA_BUDGET_KB = 150;

/**
 * The committed zone rules release, relative to the package root; read by the
 * compiler, the check, the Vite plugin and the budget steps.
 * Implements FR2 of add-zone-rules-from-iana (D1).
 */
export const ZONE_RULES_RELEASE_FILE = "zone-rules/release.json";

/**
 * The committed zone coordinates, written by the compiler together with the
 * release file; read by the check and the search data build.
 * Implements FR2, FR3 of add-city-coordinates-to-locations (D3).
 */
export const ZONE_COORDINATES_FILE = "zone-rules/zone-coordinates.json";

/**
 * Gzipped size ceiling of the `sunSupport` chunk (the sun calculation and the
 * zone coordinates), in KB, measured by `check-bundle-size.mjs`. The first
 * render waits for this chunk although it is outside the initial JavaScript
 * figure: it measures 6.6 KB gzipped; the ceiling leaves room for growth.
 * Implements NFR-P2, M3 of bind-day-periods-to-sun.
 */
export const SUN_SUPPORT_CHUNK_BUDGET_KB = 8;

/** Largest size of the served app revision file, in bytes (1 KB). */
export const APP_REVISION_FILE_MAX_BYTES = 1024;

/**
 * Name of the global that Vite's `define` replaces with the dump date of the
 * city data. Implements FR12 of apply-data-updates-silently (D6).
 */
export const CITY_DATA_DATE_DEFINE = "__CITY_DATA_DATE__";

/** The dump date of every Vitest run, so that tests do not depend on the committed city data. */
export const TEST_CITY_DATA_DATE = "2026-11-14";

/**
 * First port of the sites that the silent update E2E serves itself; each
 * Playwright worker adds its own index. Implements FR3, FR4, FR11 of
 * apply-data-updates-silently (D8).
 */
export const SILENT_UPDATE_E2E_PORT = 4180;
