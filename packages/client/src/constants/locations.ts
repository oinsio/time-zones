/** Version of the stored locations document (ADR-0004 envelope). */
export const LOCATIONS_SCHEMA_VERSION = 1;

/** Delay that collapses bursts of add/remove into one storage write. */
export const LOCATIONS_WRITE_DEBOUNCE_MS = 300;
