import { readFileSync } from "node:fs";
import { join } from "node:path";

export type Theme = "light" | "dark";

export interface ThemeColours {
  background: string;
  foreground: string;
  notice: string;
  noticeForeground: string;
  surface: string;
  border: string;
  cardBorder: string;
  overlay: string;
  danger: string;
  accent: string;
  dayNight: string;
  dayMorning: string;
  dayDaylight: string;
  dayEvening: string;
  dayNonWorking: string;
  hourCellForeground: string;
  meeting: string;
  meetingText: string;
  meetingBar: string;
}

const TOKENS_FILE = join(process.cwd(), "src", "styles", "tokens.css");
const DARK_THEME_MARKER = ':root[data-theme="dark"]';
const DARK_THEME_END_MARKER = ":root[data-day-palette";
export type DayPaletteName = "vivid" | "muted";
const HEX_RADIX = 16;
const HEX_DIGITS_PER_CHANNEL = 2;

/** The light block is `:root`, the dark block is the single `data-theme="dark"` rule (FR2 of redesign-cards-grid-and-day-palettes). */
const sliceThemeBlock = (tokensCss: string, theme: Theme): string => {
  const darkStart = tokensCss.indexOf(DARK_THEME_MARKER);
  const darkEnd = tokensCss.indexOf(DARK_THEME_END_MARKER);
  return theme === "dark"
    ? tokensCss.slice(darkStart, darkEnd)
    : tokensCss.slice(0, darkStart);
};

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
export function readThemeColours(
  theme: Theme,
  palette: DayPaletteName = "vivid",
): ThemeColours {
  const tokensCss = readFileSync(TOKENS_FILE, "utf8");
  const themeBlock = sliceThemeBlock(tokensCss, theme);
  return {
    background: toComputedRgb(readTokenHex(themeBlock, "background")),
    foreground: toComputedRgb(readTokenHex(themeBlock, "foreground")),
    notice: toComputedRgb(readTokenHex(themeBlock, "notice")),
    noticeForeground: toComputedRgb(
      readTokenHex(themeBlock, "notice-foreground"),
    ),
    surface: toComputedRgb(readTokenHex(themeBlock, "surface")),
    border: toComputedRgb(readTokenHex(themeBlock, "control-border")),
    cardBorder: toComputedRgb(readTokenHex(themeBlock, "card-border")),
    overlay: toComputedRgb(readTokenHex(themeBlock, "overlay")),
    danger: toComputedRgb(readTokenHex(themeBlock, "danger")),
    accent: toComputedRgb(readTokenHex(themeBlock, "accent")),
    dayNight: toComputedRgb(readTokenHex(themeBlock, `day-${palette}-night`)),
    dayMorning: toComputedRgb(
      readTokenHex(themeBlock, `day-${palette}-morning`),
    ),
    dayDaylight: toComputedRgb(
      readTokenHex(themeBlock, `day-${palette}-daylight`),
    ),
    dayEvening: toComputedRgb(
      readTokenHex(themeBlock, `day-${palette}-evening`),
    ),
    dayNonWorking: toComputedRgb(readTokenHex(themeBlock, "day-non-working")),
    hourCellForeground: toComputedRgb(
      readTokenHex(themeBlock, "hour-cell-foreground"),
    ),
    meeting: toComputedRgb(readTokenHex(themeBlock, "meeting")),
    meetingText: toComputedRgb(readTokenHex(themeBlock, "meeting-text")),
    meetingBar: toComputedRgb(readTokenHex(themeBlock, "meeting-bar")),
  };
}

const RGBA_PATTERN = /rgba\(([^)]*)\)/;

/**
 * The midnight cell shade of a theme as `styles/tokens.css` declares it,
 * as the computed `rgba(...)` text.
 * Implements FR5 of add-grid-hour-cells-and-hour-frame (D6).
 */
export function readMidnightShade(theme: Theme): string {
  const tokensCss = readFileSync(TOKENS_FILE, "utf8");
  const themeBlock = sliceThemeBlock(tokensCss, theme);
  const shadeMatch = themeBlock.match(
    new RegExp(`--color-midnight-shade:\\s*${RGBA_PATTERN.source}`),
  );
  if (!shadeMatch) throw new Error("Token --color-midnight-shade not found");
  return `rgba(${shadeMatch[1]})`;
}
