import type { Config } from "tailwindcss";
import defaultTheme from "tailwindcss/defaultTheme";
import animate from "tailwindcss-animate";

/** Font family name registered by @fontsource-variable/manrope. */
const MANROPE_FONT_FAMILY = "Manrope Variable";

/** Font size of the Gnomish Factory credit: 16.5 px, 15-20 % above 14 px. Implements FR3 of move-and-restyle-gnomish-factory-credit (D3). */
const CREDIT_FONT_SIZE = "1.03125rem";

/** Line height of the Gnomish Factory credit. Implements FR3 of move-and-restyle-gnomish-factory-credit (D3). */
const CREDIT_LINE_HEIGHT = "1.5rem";

const DVH_WITH_VH_FALLBACK = ["100vh", "100dvh"];

const config: Config = {
  darkMode: "media",
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      boxShadow: { lift: "var(--lift-shadow)" },
      /** The content column of the page: 1120 px. Implements FR12 of redesign-cards-grid-and-day-palettes (D4). */
      maxWidth: { content: "70rem" },
      fontSize: {
        credit: [CREDIT_FONT_SIZE, CREDIT_LINE_HEIGHT],
        "header-title": "27px",
        "header-title-narrow": "23px",
        // Card sizes, spec.md section 5 and 6: the narrow, the 411 px and the 360 px sets.
        "card-city": "24px",
        "card-city-large": "26px",
        "card-city-small": "21px",
        "card-time": "26px",
        "card-time-large": "28px",
        "card-time-small": "24px",
        "card-difference": "16px",
        "card-meta": "14px",
        "card-meta-large": "15px",
        "card-meta-small": "13px",
        "card-marker": "14px",
        // Grid row header sizes, spec.md section 10.
        "grid-city": "20px",
        "grid-city-wide": "22px",
        "grid-time": "24px",
        "grid-time-wide": "26px",
        "grid-meta": "14px",
        "grid-cell": "15px",
      },
      borderRadius: { card: "14px", cell: "5px", now: "13px" },
      spacing: {
        column: "13px",
        "card-top": "10px",
        "card-bottom": "11px",
        "card-side-small": "13px",
        "card-side": "15px",
        "card-side-large": "18px",
        "card-wide-y": "12px",
        "card-wide-x": "20px",
        "card-gap": "12px",
        // The visible handle of a day track: 23 px.
        handle: "23px",
      },
      /** Page layers, lowest first. Implements FR6, FR7 of fix-grid-meeting-range-lock-and-layering (D5). */
      zIndex: {
        "grid-frame": "1",
        "grid-box": "2",
        "meeting-handle": "3",
        "grid-box-focused": "4",
        "meeting-bar": "5",
        "page-bar": "10",
        "dragged-row": "15",
        "location-menu": "20",
        dialog: "30",
      },
      colors: {
        background: "var(--color-background)",
        foreground: "var(--color-foreground)",
        muted: "var(--color-muted)",
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
        "card-border": "var(--color-card-border)",
        "control-border": "var(--color-control-border)",
        "control-border-inactive": "var(--color-control-border-inactive)",
        "handle-border": "var(--color-handle-border)",
        overlay: "var(--color-overlay)",
        danger: "var(--color-danger)",
        meeting: "var(--color-meeting)",
        "meeting-text": "var(--color-meeting-text)",
        "meeting-bar": "var(--color-meeting-bar)",
        "midnight-shade": "var(--color-midnight-shade)",
        "hour-cell-foreground": "var(--color-hour-cell-foreground)",
        day: {
          night: "var(--color-day-night)",
          morning: "var(--color-day-morning)",
          daylight: "var(--color-day-daylight)",
          evening: "var(--color-day-evening)",
          "non-working": "var(--color-day-non-working)",
        },
      },
      // Fallback for engines without the dvh unit (iOS Safari before 15.4): both
      // declarations are emitted in this order. Implements FR12 of
      // support-legacy-ios-12-safari (D7).
      // Tailwind accepts a fallback array here; its typings only allow a string.
      minHeight: { dvh: DVH_WITH_VH_FALLBACK as unknown as string },
      // The content scan also emits `.h-dvh` from the `min-h-dvh` class name.
      height: { dvh: DVH_WITH_VH_FALLBACK as unknown as string },
      fontFamily: {
        sans: [MANROPE_FONT_FAMILY, ...defaultTheme.fontFamily.sans],
      },
    },
  },
  plugins: [animate],
};

export default config;
