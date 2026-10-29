import type { Config } from "tailwindcss";
import defaultTheme from "tailwindcss/defaultTheme";
import animate from "tailwindcss-animate";

/** Font family name registered by @fontsource-variable/manrope. */
const MANROPE_FONT_FAMILY = "Manrope Variable";

const DVH_WITH_VH_FALLBACK = ["100vh", "100dvh"];

const config: Config = {
  darkMode: "media",
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "var(--color-background)",
        foreground: "var(--color-foreground)",
        "muted-foreground": "var(--color-muted-foreground)",
        accent: {
          DEFAULT: "var(--color-accent)",
          foreground: "var(--color-accent-foreground)",
        },
        notice: {
          DEFAULT: "var(--color-notice)",
          foreground: "var(--color-notice-foreground)",
        },
        surface: "var(--color-surface)",
        border: "var(--color-border)",
        overlay: "var(--color-overlay)",
        danger: "var(--color-danger)",
        day: {
          night: "var(--color-day-night)",
          morning: "var(--color-day-morning)",
          working: "var(--color-day-working)",
          evening: "var(--color-day-evening)",
        },
      },
      // Fallback for engines without the dvh unit (iOS Safari before 15.4): both
      // declarations are emitted in this order. Implements FR12 of
      // support-legacy-ios-12-safari (D7).
      minHeight: {
        // Tailwind accepts a fallback array here; its typings only allow a string.
        dvh: DVH_WITH_VH_FALLBACK as unknown as string,
      },
      fontFamily: {
        sans: [MANROPE_FONT_FAMILY, ...defaultTheme.fontFamily.sans],
      },
    },
  },
  plugins: [animate],
};

export default config;
