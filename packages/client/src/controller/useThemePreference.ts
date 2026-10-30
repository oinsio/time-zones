import { useLayoutEffect } from "react";
import { ThemePreference } from "@/preferences";
import { usePreferences } from "./usePreferences";

const THEME_ATTRIBUTE_VALUES: Record<ThemePreference, string | undefined> = {
  [ThemePreference.LIGHT]: "light",
  [ThemePreference.DARK]: "dark",
  [ThemePreference.SYSTEM]: undefined,
};

/**
 * Applies the theme preference to the document root as `data-theme`; SYSTEM
 * removes it, so the system colour scheme decides through CSS alone. Runs
 * before the browser paints the first commit.
 * Implements FR4 of add-settings-page-and-device-time-location (D7).
 */
export function useThemePreference(): void {
  const { preferences } = usePreferences();
  const themeAttributeValue = THEME_ATTRIBUTE_VALUES[preferences.theme];
  useLayoutEffect(() => {
    const rootElement = document.documentElement;
    if (themeAttributeValue === undefined) delete rootElement.dataset.theme;
    else rootElement.dataset.theme = themeAttributeValue;
  }, [themeAttributeValue]);
}
