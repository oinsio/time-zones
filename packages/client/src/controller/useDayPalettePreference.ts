import { useLayoutEffect } from "react";
import { DayPalette } from "@/preferences";
import { usePreferences } from "./usePreferences";

const DAY_PALETTE_ATTRIBUTE_VALUES: Record<DayPalette, string> = {
  [DayPalette.VIVID]: "vivid",
  [DayPalette.MUTED]: "muted",
};

/**
 * Applies the day palette to the document root as `data-day-palette`; the
 * token source points the day period colours at the palette in force, so a
 * change re-presents nothing. Runs before the browser paints the first commit.
 * Implements FR4 of redesign-cards-grid-and-day-palettes (D2).
 */
export function useDayPalettePreference(): void {
  const { preferences } = usePreferences();
  const dayPaletteAttributeValue =
    DAY_PALETTE_ATTRIBUTE_VALUES[preferences.dayPalette];
  useLayoutEffect(() => {
    document.documentElement.dataset.dayPalette = dayPaletteAttributeValue;
  }, [dayPaletteAttributeValue]);
}
