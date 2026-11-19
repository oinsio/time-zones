/** Version of the stored locations document (ADR-0004 envelope). */
export const LOCATIONS_SCHEMA_VERSION = 4;

/**
 * Id of the device time location; has no `|`, so it never equals a city id.
 * Implements FR8 of add-settings-page-and-device-time-location (D1).
 */
export const DEVICE_TIME_LOCATION_ID = "device-time";

/** Delay that collapses bursts of add/remove into one storage write. */
export const LOCATIONS_WRITE_DEBOUNCE_MS = 300;

/**
 * Side of the icon in the leading mark slot of a card, in px.
 * Implements FR10 of redesign-cards-grid-and-day-palettes (D7).
 */
export const LOCATION_MARK_ICON_SIZE_PX = 23;

/**
 * Side of the icon in the leading mark slot of a grid row, in px.
 * Implements FR17 of redesign-cards-grid-and-day-palettes (D5).
 */
export const GRID_MARK_ICON_SIZE_PX = 20;

/**
 * The glyph on the location menu button.
 * Implements FR11 of set-home-location-and-show-differences (D7).
 */
export const LOCATION_MENU_TRIGGER_GLYPH = "⋯";
