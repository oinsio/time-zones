// Verifies NFR-A1 of colour-locations-without-day-periods-in-accent.
// Verifies FR4, NFR-A3 of add-settings-page-and-device-time-location (D7).
// Verifies NFR-A3 of keep-now-button-visible-when-live.
// Verifies UX5, NFR-A1 of add-locations-via-search (D10).
// Verifies NFR-A3, UX4 of add-day-colouring-setting.
// Verifies FR1, FR2, NFR-A2, M4 of redesign-cards-grid-and-day-palettes.
import { describe, expect, it } from "vitest";
import {
  contrastRatio,
  readRequired,
  readToken,
  type TokenTheme,
  themeBlocks,
  tokensCss,
} from "./tokensTestHelpers";

const MIN_TEXT_CONTRAST = 4.5;
const MIN_NON_TEXT_CONTRAST = 3;
const COLOUR_DECLARATION_PATTERN = /--color-[a-z-]+(?=:)/g;

/** The §2 values of spec.md, per theme. */
const SPEC_TOKENS: Record<string, [string, string]> = {
  background: ["#f7f7f5", "#0b1628"],
  surface: ["#ffffff", "#142136"],
  "card-border": ["#a9adb8", "#647a98"],
  "control-border": ["#8a8a93", "#6b7a99"],
  "control-border-inactive": ["#c9ccd4", "#33415c"],
  foreground: ["#1c1c20", "#f7f8fc"],
  "muted-foreground": ["#60616c", "#9aaed1"],
  accent: ["#3159e7", "#4dd5f4"],
  "accent-foreground": ["#ffffff", "#0b1220"],
  "handle-border": ["#1c1c20", "#f8f9ff"],
  "hour-cell-foreground": ["#1c1c20", "#0b1628"],
};

describe.each(["light", "dark"] as const)(
  "design tokens (%s theme)",
  (theme: TokenTheme) => {
    const themeIndex = theme === "light" ? 0 : 1;

    it.each(Object.entries(SPEC_TOKENS))(
      "should give --color-%s the specified value",
      (name, values) => {
        expect(readToken(theme, name)).toBe(values[themeIndex]);
      },
    );

    it.each(["surface", "overlay", "danger", "muted"])(
      "should declare --color-%s as 6-digit hex",
      (name) => {
        expect(readToken(theme, name)).toMatch(/^#[0-9a-fA-F]{6}$/);
      },
    );

    it("should declare no colour token twice in the block", () => {
      const names = themeBlocks[theme].match(COLOUR_DECLARATION_PATTERN) ?? [];
      expect(new Set(names).size).toBe(names.length);
    });

    it("should not declare the removed --color-border", () => {
      expect(themeBlocks[theme]).not.toMatch(/--color-border\s*:/);
    });

    it.each(["background", "surface"])(
      "should give danger text at least 4.5:1 against %s",
      (backdrop) => {
        expect(
          contrastRatio(
            readRequired(theme, "danger"),
            readRequired(theme, backdrop),
          ),
        ).toBeGreaterThanOrEqual(MIN_TEXT_CONTRAST);
      },
    );

    it.each(["foreground", "muted-foreground", "accent"])(
      "should give %s text at least 4.5:1 against the background and the surface",
      (name) => {
        for (const backdrop of ["background", "surface"]) {
          expect(
            contrastRatio(
              readRequired(theme, name),
              readRequired(theme, backdrop),
            ),
          ).toBeGreaterThanOrEqual(MIN_TEXT_CONTRAST);
        }
      },
    );

    it("should give the muted foreground at least 4.5:1 against the muted fill", () => {
      expect(
        contrastRatio(
          readRequired(theme, "muted-foreground"),
          readRequired(theme, "muted"),
        ),
      ).toBeGreaterThanOrEqual(MIN_TEXT_CONTRAST);
    });

    it("should give the control border at least 3:1 against the surface", () => {
      expect(
        contrastRatio(
          readRequired(theme, "control-border"),
          readRequired(theme, "surface"),
        ),
      ).toBeGreaterThanOrEqual(MIN_NON_TEXT_CONTRAST);
    });

    it("should give the inactive Now label at least 4.5:1 against the background", () => {
      expect(
        contrastRatio(
          readRequired(theme, "muted-foreground"),
          readRequired(theme, "background"),
        ),
      ).toBeGreaterThanOrEqual(MIN_TEXT_CONTRAST);
    });
  },
);

describe("theme blocks", () => {
  it("should write the dark theme once, with no system dark block in the source", () => {
    expect(tokensCss.match(/data-theme="dark"/g)).toHaveLength(1);
    expect(tokensCss).not.toContain("prefers-color-scheme");
  });

  it.each(["light", "dark"] as const)(
    "should declare color-scheme %s",
    (theme) => {
      expect(themeBlocks[theme]).toContain(`color-scheme: ${theme};`);
    },
  );

  it("should keep the card border exempt from 3:1 (accepted 2.2:1 in light)", () => {
    const ratio = contrastRatio(
      readRequired("light", "card-border"),
      readRequired("light", "surface"),
    );
    expect(ratio).toBeLessThan(MIN_NON_TEXT_CONTRAST);
  });
});
