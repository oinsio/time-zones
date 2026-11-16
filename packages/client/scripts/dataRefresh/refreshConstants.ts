/**
 * Constants of the data refresh scripts: the trailer, the sources, the branches,
 * the labels, the guard thresholds and the data paths of each source.
 * Plain `as const` objects, because the scripts run under Node's type stripping.
 * Implements FR3, FR5, FR6, FR7 of refresh-data-through-scheduled-pull-requests (D3, D5, D6).
 */

export const DATA_ONLY_TRAILER = "Data-Only: true";

export const REFRESH_SOURCES = {
  ZONE_RULES: "zone-rules",
  CITY_DATA: "city-data",
  CLDR: "cldr",
} as const;

export type RefreshSource =
  (typeof REFRESH_SOURCES)[keyof typeof REFRESH_SOURCES];

export const REFRESH_BRANCHES = {
  [REFRESH_SOURCES.ZONE_RULES]: "data-refresh/zone-rules",
  [REFRESH_SOURCES.CITY_DATA]: "data-refresh/city-data",
} as const;

/** The dependency bot's branch prefix of the CLDR group. */
export const CLDR_BRANCH_PREFIX = "dependabot/npm_and_yarn/cldr";

export const NEEDS_REVIEW_LABEL = "needs-review";
export const REFRESH_FAILURE_LABEL = "data-refresh-failure";

/** More than this share of the committed cities missing needs a review. */
export const MAX_REMOVED_CITY_SHARE = 0.01;
/** A missing committed city with at least this population needs a review. */
export const LARGE_CITY_POPULATION = 1_000_000;

export const REFRESH_VERDICTS = {
  UNCHANGED: "UNCHANGED",
  MERGE: "MERGE",
  NEEDS_REVIEW: "NEEDS_REVIEW",
} as const;

export type RefreshVerdict =
  (typeof REFRESH_VERDICTS)[keyof typeof REFRESH_VERDICTS];

export const ZONE_RULES_DATA_PATH = "packages/client/zone-rules/";
export const CITY_DATA_DATA_PATH = "packages/client/city-data/";
export const CLIENT_MANIFEST_PATH = "packages/client/package.json";
export const LOCKFILE_PATH = "pnpm-lock.yaml";
export const CLDR_PACKAGE_NAMES = ["cldr-bcp47", "cldr-dates-full"] as const;

/** Directory prefixes (ending in `/`) and exact file paths a source may change. */
export const DATA_PATHS = {
  [REFRESH_SOURCES.ZONE_RULES]: [ZONE_RULES_DATA_PATH],
  [REFRESH_SOURCES.CITY_DATA]: [CITY_DATA_DATA_PATH],
  [REFRESH_SOURCES.CLDR]: [CLIENT_MANIFEST_PATH, LOCKFILE_PATH],
} as const;
