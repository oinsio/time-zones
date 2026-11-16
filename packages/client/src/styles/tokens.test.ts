// Verifies FR4, NFR-A3 of add-settings-page-and-device-time-location (D7).
// Verifies NFR-A3 of keep-now-button-visible-when-live.
// Verifies UX5, NFR-A1 of add-locations-via-search (D10).
// Verifies NFR-A3, UX4 of add-day-colouring-setting.
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const TOKENS_FILE = join(process.cwd(), "src", "styles", "tokens.css");
const LIGHT_SELECTOR = ":root {";
const FORCED_DARK_SELECTOR = ':root[data-theme="dark"] {';
const SYSTEM_DARK_SELECTOR = ':root:not([data-theme="light"]) {';
const BLOCK_END = "}";
const COLOR_TOKEN_PATTERN = /--color-[a-z-]+:\s*#[0-9a-fA-F]{6}\s*;/g;
const NEW_TOKENS = ["surface", "border", "overlay", "danger", "muted"];
const MIN_TEXT_CONTRAST = 4.5;
const MIN_NON_TEXT_CONTRAST = 3;
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

const tokensCss = readFileSync(TOKENS_FILE, "utf8");
const readBlock = (selector: string): string => {
  const start = tokensCss.indexOf(selector);
  if (start < 0) throw new Error(`${selector} missing in tokens.css`);
  return tokensCss.slice(start, tokensCss.indexOf(BLOCK_END, start));
};
const themeBlocks = {
  light: readBlock(LIGHT_SELECTOR),
  dark: readBlock(FORCED_DARK_SELECTOR),
};
const systemDarkBlock = readBlock(SYSTEM_DARK_SELECTOR);

const readToken = (theme: "light" | "dark", name: string): string | undefined =>
  themeBlocks[theme].match(
    new RegExp(`--color-${name}:\\s*(#[0-9a-fA-F]{6})\\s*;`),
  )?.[1];

const linearize = (channel: number): number => {
  const scaled = channel / CHANNEL_MAX;
  return scaled <= LINEARIZE_THRESHOLD
    ? scaled / LINEARIZE_DIVISOR
    : ((scaled + LINEARIZE_OFFSET) / LINEARIZE_SCALE) ** LINEARIZE_EXPONENT;
};

const luminance = (hexColour: string): number => {
  const [red, green, blue] = [1, 3, 5].map((start) =>
    linearize(Number.parseInt(hexColour.slice(start, start + 2), HEX_RADIX)),
  );
  return RED_WEIGHT * red + GREEN_WEIGHT * green + BLUE_WEIGHT * blue;
};

const contrastRatio = (first: string, second: string): number => {
  const [lighter, darker] = [luminance(first), luminance(second)].sort(
    (a, b) => b - a,
  );
  return (lighter + CONTRAST_OFFSET) / (darker + CONTRAST_OFFSET);
};

const readRequired = (theme: "light" | "dark", name: string): string => {
  const value = readToken(theme, name);
  if (!value) throw new Error(`--color-${name} missing in ${theme} theme`);
  return value;
};

describe.each(["light", "dark"] as const)(
  "design tokens (%s theme)",
  (theme) => {
    it.each(NEW_TOKENS)("should declare --color-%s as 6-digit hex", (name) => {
      expect(readToken(theme, name)).toMatch(/^#[0-9a-fA-F]{6}$/);
    });

    it.each(["background", "surface"])(
      "should give danger text at least 4.5:1 against %s",
      (backdrop) => {
        const ratio = contrastRatio(
          readRequired(theme, "danger"),
          readRequired(theme, backdrop),
        );
        expect(ratio).toBeGreaterThanOrEqual(MIN_TEXT_CONTRAST);
      },
    );

    it("should give the muted foreground at least 4.5:1 against the muted fill", () => {
      const ratio = contrastRatio(
        readRequired(theme, "muted-foreground"),
        readRequired(theme, "muted"),
      );
      expect(ratio).toBeGreaterThanOrEqual(MIN_TEXT_CONTRAST);
    });

    it("should give the border at least 3:1 against the surface", () => {
      const ratio = contrastRatio(
        readRequired(theme, "border"),
        readRequired(theme, "surface"),
      );
      expect(ratio).toBeGreaterThanOrEqual(MIN_NON_TEXT_CONTRAST);
    });
  },
);

/** Each day colour's fill token and the token its digits use (D6, the classes of `DAY_COLOUR_FOREGROUND_CLASS_NAMES`). */
const DAY_COLOUR_TOKENS = [
  ["night", "day-night", "foreground"],
  ["morning", "day-morning", "hour-cell-foreground"],
  ["day", "day-daylight", "hour-cell-foreground"],
  ["evening", "day-evening", "hour-cell-foreground"],
  ["plain", "accent", "accent-foreground"],
  ["working time", "accent", "accent-foreground"],
  ["non-working time", "day-non-working", "foreground"],
] as const;
const DAY_PERIOD_TOKENS = [
  "day-night",
  "day-morning",
  "day-daylight",
  "day-evening",
];

describe.each(["light", "dark"] as const)("day colours (%s theme)", (theme) => {
  it.each(DAY_COLOUR_TOKENS)(
    "should give the digits on %s at least 4.5:1",
    (_, fillToken, digitToken) => {
      expect(
        contrastRatio(
          readRequired(theme, digitToken),
          readRequired(theme, fillToken),
        ),
      ).toBeGreaterThanOrEqual(MIN_TEXT_CONTRAST);
    },
  );

  it.each(DAY_COLOUR_TOKENS)(
    "should keep the handle at least 3:1 against %s",
    (_, fillToken) => {
      const fill = readRequired(theme, fillToken);
      const bestRatio = Math.max(
        contrastRatio(readRequired(theme, "surface"), fill),
        contrastRatio(readRequired(theme, "foreground"), fill),
      );
      expect(bestRatio).toBeGreaterThanOrEqual(MIN_NON_TEXT_CONTRAST);
    },
  );

  it("should make the non-working grey differ from the accent", () => {
    expect(readRequired(theme, "day-non-working")).not.toBe(
      readRequired(theme, "accent"),
    );
  });
});

describe("the non-working grey against the day-period colours", () => {
  it.each(DAY_PERIOD_TOKENS)("should be lighter than %s in light", (token) => {
    expect(luminance(readRequired("light", "day-non-working"))).toBeGreaterThan(
      luminance(readRequired("light", token)),
    );
  });

  it.each(DAY_PERIOD_TOKENS)("should be darker than %s in dark", (token) => {
    expect(luminance(readRequired("dark", "day-non-working"))).toBeLessThan(
      luminance(readRequired("dark", token)),
    );
  });
});

describe("theme blocks", () => {
  it("should give the forced dark block and the system dark block the same values", () => {
    const forcedDarkTokens = themeBlocks.dark.match(COLOR_TOKEN_PATTERN);
    expect(forcedDarkTokens?.length).toBeGreaterThan(0);
    expect(systemDarkBlock.match(COLOR_TOKEN_PATTERN)).toEqual(
      forcedDarkTokens,
    );
  });

  it.each(["light", "dark"] as const)(
    "should declare color-scheme %s",
    (theme) => {
      expect(themeBlocks[theme]).toContain(`color-scheme: ${theme};`);
    },
  );

  it("should declare color-scheme dark in the system dark block", () => {
    expect(systemDarkBlock).toContain("color-scheme: dark;");
  });
});
