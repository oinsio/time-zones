import { useLayoutEffect } from "react";
import { usePreferences } from "./usePreferences";

/**
 * Applies the day palette to the document root as `data-day-palette` (the
 * lower-case palette name: `vivid`, `muted`); the token source points the day
 * period colours at the palette in force, so a change re-presents nothing. Runs
 * before the browser paints the first commit.
 * Implements FR4 of redesign-cards-grid-and-day-palettes (D2).
 */
export function useDayPalettePreference(): void {
  const { preferences } = usePreferences();
  const dayPaletteName = preferences.dayPalette.toLowerCase();
  useLayoutEffect(() => {
    document.documentElement.dataset.dayPalette = dayPaletteName;
  }, [dayPaletteName]);
}
