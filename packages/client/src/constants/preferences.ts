/** Version of the stored preferences document (ADR-0004 envelope). */
export const PREFERENCES_SCHEMA_VERSION = 1;

/** Delay that collapses bursts of preference changes into one storage write. */
export const PREFERENCES_WRITE_DEBOUNCE_MS = 300;

/**
 * Number of languages from which the language group shows a search field.
 * Implements FR6 of add-interface-language-selection.
 */
export const LANGUAGE_SEARCH_MIN_LOCALES = 10;
