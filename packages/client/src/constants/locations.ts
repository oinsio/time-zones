/** Version of the stored locations document (ADR-0004 envelope). */
export const LOCATIONS_SCHEMA_VERSION = 2;

/** Delay that collapses bursts of add/remove into one storage write. */
export const LOCATIONS_WRITE_DEBOUNCE_MS = 300;

/**
 * Side of the icon in the leading mark slot of a location row; the design
 * screens (phone-no-home, phone-travel) draw it at width="18".
 * Implements UX1 of match-here-mark-to-design.
 */
export const LOCATION_MARK_ICON_SIZE_PX = 18;
