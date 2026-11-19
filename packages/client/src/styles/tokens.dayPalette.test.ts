// Verifies FR3, FR4, NFR-A2 of redesign-cards-grid-and-day-palettes.
import { describe, expect, it } from "vitest";
import {
  contrastRatio,
  luminance,
  readRequired,
  type TokenTheme,
  tokensCss,
} from "./tokensTestHelpers";

const MIN_TEXT_CONTRAST = 4.5;
const MIN_NON_TEXT_CONTRAST = 3;
const PALETTES = ["vivid", "muted"] as const;
const PERIODS = ["night", "morning", "daylight", "evening"] as const;

/** The §3 values of spec.md: [vivid light, vivid dark, muted light, muted dark]. */
const SPEC_PALETTES: Record<(typeof PERIODS)[number], string[]> = {
  night: ["#a4afd4", "#4c5efa", "#a3afd3", "#56679a"],
  morning: ["#f0c6b8", "#ffc3a5", "#f8cbbe", "#e0b1a4"],
  daylight: ["#f8e5a0", "#fff68e", "#f8e6a6", "#eedba3"],
  evening: ["#e8c7df", "#fda9e9", "#d4c6ee", "#b9aadb"],
};
const COLUMN: Record<string, number> = {
  "vivid light": 0,
  "vivid dark": 1,
  "muted light": 2,
  "muted dark": 3,
};
const PAIRS = (["light", "dark"] as const).flatMap((theme) =>
  PALETTES.map((palette) => [theme, palette] as const),
);

describe("day palette tokens", () => {
  it.each(
    PALETTES.flatMap((palette) =>
      (["light", "dark"] as const).flatMap((theme) =>
        PERIODS.map((period) => [palette, theme, period] as const),
      ),
    ),
  )(
    "should give the %s palette in the %s theme its %s colour",
    (palette, theme, period) => {
      expect(readRequired(theme, `day-${palette}-${period}`)).toBe(
        SPEC_PALETTES[period][COLUMN[`${palette} ${theme}`]],
      );
    },
  );

  it("should point the period tokens at Vivid by default", () => {
    expect(tokensCss).toContain(
      "--color-day-night: var(--color-day-vivid-night);",
    );
  });

  it("should point the period tokens at Muted when data-day-palette is muted", () => {
    const mutedBlock = tokensCss.slice(
      tokensCss.indexOf(':root[data-day-palette="muted"]'),
    );
    for (const period of PERIODS) {
      expect(mutedBlock).toContain(
        `--color-day-${period}: var(--color-day-muted-${period});`,
      );
    }
  });
});

describe.each(PAIRS)("day colours (%s theme, %s palette)", (theme, palette) => {
  const digitToken = (period: (typeof PERIODS)[number]) =>
    period === "night" ? "foreground" : "hour-cell-foreground";

  it.each(PERIODS)("should give the digits on %s at least 4.5:1", (period) => {
    expect(
      contrastRatio(
        readRequired(theme, digitToken(period)),
        readRequired(theme, `day-${palette}-${period}`),
      ),
    ).toBeGreaterThanOrEqual(MIN_TEXT_CONTRAST);
  });

  it.each(PERIODS)(
    "should keep the handle at least 3:1 against %s",
    (period) => {
      const fill = readRequired(theme, `day-${palette}-${period}`);
      const bestRatio = Math.max(
        contrastRatio(readRequired(theme, "surface"), fill),
        contrastRatio(readRequired(theme, "foreground"), fill),
      );
      expect(bestRatio).toBeGreaterThanOrEqual(MIN_NON_TEXT_CONTRAST);
    },
  );

  it.each(PERIODS)(
    "should keep the non-working grey apart from %s",
    (period) => {
      const grey = luminance(readRequired(theme, "day-non-working"));
      const periodLuminance = luminance(
        readRequired(theme, `day-${palette}-${period}`),
      );
      if (theme === "light") expect(grey).toBeGreaterThan(periodLuminance);
      else expect(grey).toBeLessThan(periodLuminance);
    },
  );
});

describe.each(["light", "dark"] as const)(
  "accent and non-working (%s theme)",
  (theme: TokenTheme) => {
    it("should give digits on the accent at least 4.5:1", () => {
      expect(
        contrastRatio(
          readRequired(theme, "accent-foreground"),
          readRequired(theme, "accent"),
        ),
      ).toBeGreaterThanOrEqual(MIN_TEXT_CONTRAST);
    });

    it("should give digits on the non-working grey at least 4.5:1", () => {
      expect(
        contrastRatio(
          readRequired(theme, "foreground"),
          readRequired(theme, "day-non-working"),
        ),
      ).toBeGreaterThanOrEqual(MIN_TEXT_CONTRAST);
    });

    it("should make the non-working grey differ from the accent", () => {
      expect(readRequired(theme, "day-non-working")).not.toBe(
        readRequired(theme, "accent"),
      );
    });
  },
);
