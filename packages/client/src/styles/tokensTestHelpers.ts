// Verifies FR1, FR2, NFR-A2 of redesign-cards-grid-and-day-palettes.
import { readFileSync } from "node:fs";
import { join } from "node:path";

export type TokenTheme = "light" | "dark";

const TOKENS_FILE = join(process.cwd(), "src", "styles", "tokens.css");
const LIGHT_SELECTOR = ":root {";
const DARK_SELECTOR = ':root[data-theme="dark"] {';
const BLOCK_END = "}";
const HEX_RADIX = 16;
const CHANNEL_MAX = 255;
const LINEARIZE_THRESHOLD = 0.03928;
const LINEARIZE_DIVISOR = 12.92;
const LINEARIZE_OFFSET = 0.055;
const LINEARIZE_SCALE = 1.055;
const LINEARIZE_EXPONENT = 2.4;
const RED_WEIGHT = 0.2126;
const GREEN_WEIGHT = 0.7152;
const BLUE_WEIGHT = 0.0722;
const CONTRAST_OFFSET = 0.05;

export const tokensCss = readFileSync(TOKENS_FILE, "utf8");

const readBlock = (selector: string): string => {
  const start = tokensCss.indexOf(selector);
  if (start < 0) throw new Error(`${selector} missing in tokens.css`);
  return tokensCss.slice(start, tokensCss.indexOf(BLOCK_END, start));
};

export const themeBlocks: Record<TokenTheme, string> = {
  light: readBlock(LIGHT_SELECTOR),
  dark: readBlock(DARK_SELECTOR),
};

export const readToken = (
  theme: TokenTheme,
  name: string,
): string | undefined =>
  themeBlocks[theme].match(
    new RegExp(`--color-${name}:\\s*(#[0-9a-fA-F]{6})\\s*;`),
  )?.[1];

export const readRequired = (theme: TokenTheme, name: string): string => {
  const value = readToken(theme, name);
  if (!value) throw new Error(`--color-${name} missing in ${theme} theme`);
  return value;
};

const linearize = (channel: number): number => {
  const scaled = channel / CHANNEL_MAX;
  return scaled <= LINEARIZE_THRESHOLD
    ? scaled / LINEARIZE_DIVISOR
    : ((scaled + LINEARIZE_OFFSET) / LINEARIZE_SCALE) ** LINEARIZE_EXPONENT;
};

export const luminance = (hexColour: string): number => {
  const [red, green, blue] = [1, 3, 5].map((start) =>
    linearize(Number.parseInt(hexColour.slice(start, start + 2), HEX_RADIX)),
  );
  return RED_WEIGHT * red + GREEN_WEIGHT * green + BLUE_WEIGHT * blue;
};

export const contrastRatio = (first: string, second: string): number => {
  const [lighter, darker] = [luminance(first), luminance(second)].sort(
    (a, b) => b - a,
  );
  return (lighter + CONTRAST_OFFSET) / (darker + CONTRAST_OFFSET);
};
