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
/** Matches the logo's outline, so the rim blends into the opaque icon background. */
export const APP_ICON_BACKGROUND_COLOR = "#061229";
/**
 * Share of the maskable icon kept free around the logo: the logo spans 85%, so
 * the map content stays inside the 80% safe-zone circle of any launcher mask.
 */
export const MASKABLE_ICON_PADDING = 0.15;
/** iOS only rounds the corners, so the Apple touch icon needs a thin margin. */
export const APPLE_ICON_PADDING = 0.08;

/** Port of the production preview server that the E2E tests run against. */
export const E2E_PORT = 4173;
