import { KeyboardKey } from "./keyboard";

/** Version of the stored preferences document (ADR-0004 envelope). */
export const PREFERENCES_SCHEMA_VERSION = 2;

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
