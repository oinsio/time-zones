/**
 * Where the site serves the zone rules version file, relative to the base path.
 * Implements FR2 of add-remote-zone-rules-updates (design D4).
 */
export const ZONE_RULES_VERSION_PATH = "zone-rules/version.json";

/** Directory of the served zone rules release files, named `<release>.json`. */
export const ZONE_RULES_RELEASE_DIRECTORY = "zone-rules/";

/** Schema version of the stored release envelope (ADR-0004). Implements FR9 of add-remote-zone-rules-updates. */
export const STORED_RELEASE_SCHEMA_VERSION = 1;
