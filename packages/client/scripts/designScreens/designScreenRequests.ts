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

/**
 * One `@font-face` for Manrope that holds the font bytes inline.
 * Implements FR5 of make-location-menu-button-vertical (D3).
 */
export function buildManropeStylesheet(fontBytes: Uint8Array): string {
  const base64Font = Buffer.from(fontBytes).toString("base64");
  return `@font-face {
  font-family: "${MANROPE_FONT_FAMILY}";
  font-style: normal;
  font-weight: ${MANROPE_FONT_WEIGHTS};
  src: url(data:font/woff2;base64,${base64Font}) format("woff2");
}
`;
}
