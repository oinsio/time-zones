/**
 * Which source a branch belongs to, and which changed paths of a data refresh
 * branch lie outside the data paths of its source.
 * Implements FR6 of refresh-data-through-scheduled-pull-requests (D5, D7).
 */
import {
  CLDR_BRANCH_PREFIX,
  CLDR_PACKAGE_NAMES,
  CLIENT_MANIFEST_PATH,
  DATA_PATHS,
  REFRESH_BRANCHES,
  REFRESH_SOURCES,
  type RefreshSource,
} from "./refreshConstants.ts";

const DIFF_FILE_HEADER_PATTERN = /^(\+\+\+|---)/;
const CHANGED_LINE_PATTERN = /^[+-]/;
const CLDR_ENTRY_PATTERN = new RegExp(
  `^[+-]\\s*"(${CLDR_PACKAGE_NAMES.join("|")})":\\s*"[^"]*",?\\s*$`,
);

/** The source whose data refresh branch `branchName` is, or `undefined` for any other branch. */
export function findSourceOfBranch(
  branchName: string,
): RefreshSource | undefined {
  if (branchName === REFRESH_BRANCHES[REFRESH_SOURCES.ZONE_RULES]) {
    return REFRESH_SOURCES.ZONE_RULES;
  }
  if (branchName === REFRESH_BRANCHES[REFRESH_SOURCES.CITY_DATA]) {
    return REFRESH_SOURCES.CITY_DATA;
  }
  return branchName.startsWith(CLDR_BRANCH_PREFIX)
    ? REFRESH_SOURCES.CLDR
    : undefined;
}

function isInDataPaths(source: RefreshSource, changedPath: string): boolean {
  return DATA_PATHS[source].some((dataPath) =>
    dataPath.endsWith("/")
      ? changedPath.startsWith(dataPath)
      : changedPath === dataPath,
  );
}

/** The changed lines of the manifest diff that are not a CLDR version entry. */
function findForeignManifestEntries(manifestDiff: string): string[] {
  return manifestDiff
    .split("\n")
    .filter(
      (line) =>
        CHANGED_LINE_PATTERN.test(line) &&
        !DIFF_FILE_HEADER_PATTERN.test(line) &&
        !CLDR_ENTRY_PATTERN.test(line),
    )
    .map((line) => line.slice(1).trim());
}

/**
 * The offending paths of a data refresh branch of `source`. For CLDR, a changed
 * manifest is judged by `manifestDiff`: only the CLDR version entries may change;
 * without a diff the manifest itself is the offender.
 */
export function findPathsOutsideData(
  source: RefreshSource,
  changedPaths: string[],
  manifestDiff?: string,
): string[] {
  const offenders = changedPaths.filter(
    (changedPath) => !isInDataPaths(source, changedPath),
  );
  const isManifestChanged = changedPaths.includes(CLIENT_MANIFEST_PATH);
  if (source !== REFRESH_SOURCES.CLDR || !isManifestChanged) {
    return offenders;
  }
  return manifestDiff === undefined
    ? [...offenders, CLIENT_MANIFEST_PATH]
    : [...offenders, ...findForeignManifestEntries(manifestDiff)];
}
