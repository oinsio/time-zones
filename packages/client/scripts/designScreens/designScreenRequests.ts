import {
  FILE_PROTOCOL,
  FONT_STYLESHEET_HOST,
  MANROPE_FONT_FAMILY,
  MANROPE_FONT_WEIGHTS,
} from "./constants.ts";

/**
 * What the renderer does with a request of a design screen. A plain `as const`
 * object, because the scripts run under Node type stripping.
 * Implements FR5 of make-location-menu-button-vertical (D3).
 */
export const DesignScreenRequest = {
  SERVE_FONT_STYLESHEET: "SERVE_FONT_STYLESHEET",
  CONTINUE: "CONTINUE",
  ABORT: "ABORT",
} as const;
export type DesignScreenRequest =
  (typeof DesignScreenRequest)[keyof typeof DesignScreenRequest];

/**
 * The font stylesheet is served from the local Manrope file, a `file:` URL
 * (the screen itself) goes on, anything else is blocked so a render is offline
 * and repeatable.
 * Implements FR5 of make-location-menu-button-vertical (D3).
 */
export function decideDesignScreenRequest(url: string): DesignScreenRequest {
  const { protocol, hostname } = new URL(url);
  if (protocol === FILE_PROTOCOL) return DesignScreenRequest.CONTINUE;
  if (hostname === FONT_STYLESHEET_HOST) {
    return DesignScreenRequest.SERVE_FONT_STYLESHEET;
  }
  return DesignScreenRequest.ABORT;
}

/** The bytes of one Manrope subset and the characters it covers. */
export interface ManropeSubsetFont {
  unicodeRange: string;
  bytes: Uint8Array;
}

/**
 * One `@font-face` per Manrope subset, each with its `unicode-range` and its
 * font bytes inline, so Latin and Cyrillic text both use Manrope.
 * Implements FR5 of make-location-menu-button-vertical (D3).
 */
export function buildManropeStylesheet(
  subsetFonts: readonly ManropeSubsetFont[],
): string {
  return subsetFonts
    .map(
      ({ unicodeRange, bytes }) => `@font-face {
  font-family: "${MANROPE_FONT_FAMILY}";
  font-style: normal;
  font-weight: ${MANROPE_FONT_WEIGHTS};
  src: url(data:font/woff2;base64,${Buffer.from(bytes).toString("base64")}) format("woff2");
  unicode-range: ${unicodeRange};
}
`,
    )
    .join("");
}
