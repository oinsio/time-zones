import { HourFormat, ThemePreference, ZoneLabelPart } from "@/preferences";
import { KeyboardKey } from "./keyboard";

/** Version of the stored preferences document (ADR-0004 envelope). */
export const PREFERENCES_SCHEMA_VERSION = 3;

/**
 * The zone of the live example under the zone label group.
 * Implements FR14 of show-zone-abbreviations-and-zone-label-setting (D5).
 * Implements FR4 of polish-settings-and-remove-offline-update-notice (D5).
 */
export const ZONE_LABEL_EXAMPLE = {
  timeZoneId: "Europe/Moscow",
  countryCode: "RU",
} as const;

/**
 * The order of the zone label parts in the zone line and in the zone label
 * group: the zone abbreviation, then the UTC offset.
 * Implements FR3, UX1 of polish-settings-and-remove-offline-update-notice (D5).
 */
export const ZONE_LABEL_PART_ORDER: readonly ZoneLabelPart[] = [
  ZoneLabelPart.ZONE_ABBREVIATION,
  ZoneLabelPart.UTC_OFFSET,
];

/** Delay that collapses bursts of preference changes into one storage write. */
export const PREFERENCES_WRITE_DEBOUNCE_MS = 300;

/**
 * Number of languages from which the language group shows a search field.
 * Implements FR6 of add-interface-language-selection.
 */
export const LANGUAGE_SEARCH_MIN_LOCALES = 10;

/** Focus step per arrow key inside the expanded interface language list. */
export const LANGUAGE_LIST_ARROW_STEP_BY_KEY: Partial<Record<string, number>> =
  {
    [KeyboardKey.ARROW_DOWN]: 1,
    [KeyboardKey.ARROW_UP]: -1,
  };

/** Elements the arrow keys move between in the interface language group. */
export const LANGUAGE_LIST_FOCUSABLE_SELECTOR =
  "input[type='search'], li button";

/** Tailwind tokens shared by the language button and its rows. */
export const LANGUAGE_BUTTON_CLASS_NAME =
  "flex min-h-11 w-full items-center gap-3 rounded-md border bg-surface px-4 py-2 font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent";

/**
 * The order of the theme options on the settings page: System, Light, Dark.
 * The enum order stays the validation list of the stored theme.
 * Implements FR2, FR3 of compact-settings-controls (D3).
 */
export const THEME_PREFERENCE_ORDER: readonly ThemePreference[] = [
  ThemePreference.SYSTEM,
  ThemePreference.LIGHT,
  ThemePreference.DARK,
];

/**
 * The language-neutral pictograms that show the hour formats.
 * Implements FR4 of compact-settings-controls (D2).
 */
export const HOUR_FORMAT_PICTOGRAMS: Record<HourFormat, string> = {
  [HourFormat.H12]: "12",
  [HourFormat.H24]: "24",
};

/**
 * Tailwind tokens of the row shared by the toggle group and the option group.
 * Implements FR5, FR6 of compact-settings-controls (D5).
 */
export const SETTINGS_GROUP_ROW_CLASS_NAME =
  "flex flex-wrap items-center justify-between gap-x-4 gap-y-2";

/** Tailwind tokens of the caption of a settings group. */
export const SETTINGS_GROUP_CAPTION_CLASS_NAME =
  "text-sm font-semibold text-muted-foreground";
