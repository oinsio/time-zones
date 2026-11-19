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
/** A Manrope subset file of `@fontsource-variable/manrope` and the characters it covers. */
export interface ManropeFontSubset {
  file: string;
  unicodeRange: string;
}
const MANROPE_FONT_FILES_FOLDER = "@fontsource-variable/manrope/files/";
/** The subsets the screens need (Latin and Cyrillic), ranges from `wght.css` of the package. */
export const MANROPE_FONT_SUBSETS: readonly ManropeFontSubset[] = [
  {
    file: `${MANROPE_FONT_FILES_FOLDER}manrope-cyrillic-ext-wght-normal.woff2`,
    unicodeRange:
      "U+0460-052F,U+1C80-1C8A,U+20B4,U+2DE0-2DFF,U+A640-A69F,U+FE2E-FE2F",
  },
  {
    file: `${MANROPE_FONT_FILES_FOLDER}manrope-cyrillic-wght-normal.woff2`,
    unicodeRange: "U+0301,U+0400-045F,U+0490-0491,U+04B0-04B1,U+2116",
  },
  {
    file: `${MANROPE_FONT_FILES_FOLDER}manrope-latin-ext-wght-normal.woff2`,
    unicodeRange:
      "U+0100-02BA,U+02BD-02C5,U+02C7-02CC,U+02CE-02D7,U+02DD-02FF,U+0304,U+0308,U+0329,U+1D00-1DBF,U+1E00-1E9F,U+1EF2-1EFF,U+2020,U+20A0-20AB,U+20AD-20C0,U+2113,U+2C60-2C7F,U+A720-A7FF",
  },
  {
    file: `${MANROPE_FONT_FILES_FOLDER}manrope-latin-wght-normal.woff2`,
    unicodeRange:
      "U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD",
  },
];
export const CSS_CONTENT_TYPE = "text/css";

export const PNG_WIDTH_OFFSET = 16;
export const PNG_HEIGHT_OFFSET = 20;
export const PNG_HEADER_BYTES = 24;
export const PNG_SIGNATURE = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
/** Wider than every screen, so the fixed-width `#screen` is never shrunk by the viewport. */
export const DESIGN_SCREEN_VIEWPORT = { width: 2000, height: 1600 };
