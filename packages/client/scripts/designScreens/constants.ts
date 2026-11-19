/** Implements FR5 of make-location-menu-button-vertical (D3). */

export const DESIGN_SCREEN_DEVICE_SCALE_FACTOR = 2;
export const DESIGN_SCREEN_SELECTOR = "#screen";
/** The folder of the design screens, relative to `packages/client`. */
export const DESIGN_SCREENS_FOLDER = "../../docs/design/screens";
export const FONT_STYLESHEET_HOST = "fonts.googleapis.com";
export const FILE_PROTOCOL = "file:";
export const HTML_EXTENSION = ".html";
export const PNG_EXTENSION = ".png";
export const MANROPE_FONT_FAMILY = "Manrope";
export const MANROPE_FONT_WEIGHTS = "400 800";
/** The Latin variable-weight file of `@fontsource-variable/manrope`. */
export const MANROPE_FONT_FILE =
  "@fontsource-variable/manrope/files/manrope-latin-wght-normal.woff2";
export const CSS_CONTENT_TYPE = "text/css";

export const PNG_WIDTH_OFFSET = 16;
export const PNG_HEIGHT_OFFSET = 20;
export const PNG_HEADER_BYTES = 24;
export const PNG_SIGNATURE = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
/** Wider than every screen, so the fixed-width `#screen` is never shrunk by the viewport. */
export const DESIGN_SCREEN_VIEWPORT = { width: 2000, height: 1600 };
