import type { Config } from "tailwindcss";
import defaultTheme from "tailwindcss/defaultTheme";
import animate from "tailwindcss-animate";

/** Font family name registered by @fontsource-variable/manrope. */
const MANROPE_FONT_FAMILY = "Manrope Variable";

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
      fontFamily: {
        sans: [MANROPE_FONT_FAMILY, ...defaultTheme.fontFamily.sans],
      },
    },
  },
  plugins: [animate],
};

export default config;
