import { readFileSync } from "node:fs";
import { join } from "node:path";

export type Theme = "light" | "dark";

export interface ThemeColours {
  background: string;
  foreground: string;
  notice: string;
  noticeForeground: string;
}

const TOKENS_FILE = join(process.cwd(), "src", "styles", "tokens.css");
const DARK_THEME_MARKER = "@media (prefers-color-scheme: dark)";
const HEX_RADIX = 16;
const HEX_DIGITS_PER_CHANNEL = 2;

const readTokenHex = (cssBlock: string, tokenName: string): string => {
  const tokenMatch = cssBlock.match(
    new RegExp(`--color-${tokenName}:\\s*(#[0-9a-fA-F]{6})`),
  );
  if (!tokenMatch) throw new Error(`Token --color-${tokenName} not found`);
  return tokenMatch[1];
};

/** Turns `#rrggbb` into the `rgb(r, g, b)` form of a computed colour. */
const toComputedRgb = (hexColour: string): string => {
  const channels = [1, 3, 5].map((startIndex) =>
    Number.parseInt(
      hexColour.slice(startIndex, startIndex + HEX_DIGITS_PER_CHANNEL),
      HEX_RADIX,
    ),
  );
  return `rgb(${channels.join(", ")})`;
};

/**
 * Colour tokens of a theme as `styles/tokens.css` declares them, normalised
 * to computed `rgb(...)` strings.
 * Verifies UX2 of add-main-page-scaffold.
 */
export function readThemeColours(theme: Theme): ThemeColours {
  const tokensCss = readFileSync(TOKENS_FILE, "utf8");
  const darkStart = tokensCss.indexOf(DARK_THEME_MARKER);
  const themeBlock =
    theme === "dark"
      ? tokensCss.slice(darkStart)
      : tokensCss.slice(0, darkStart);
  return {
    background: toComputedRgb(readTokenHex(themeBlock, "background")),
    foreground: toComputedRgb(readTokenHex(themeBlock, "foreground")),
    notice: toComputedRgb(readTokenHex(themeBlock, "notice")),
    noticeForeground: toComputedRgb(
      readTokenHex(themeBlock, "notice-foreground"),
    ),
  };
}
