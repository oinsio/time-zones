/**
 * Decides which IANA release the zone rules publication compiles: the newest
 * `tzdata` release of the releases listing, when it is newer than the
 * committed release. `pnpm --filter @time-zones/client zone-rules:latest`
 * prints the name (or `already current`) and writes `release=<name>` to
 * `$GITHUB_OUTPUT` when set.
 * Implements FR1 of add-remote-zone-rules-updates (design D7).
 */
import { appendFile, readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { ZONE_RULES_RELEASE_FILE } from "../../app.config.ts";
import {
  compareReleaseNames,
  isNewerRelease,
} from "../../src/lib/zoneRules/core/index.ts";
import { IANA_RELEASES_URL } from "./downloadRelease.ts";

const TZDATA_ARCHIVE_PATTERN = /tzdata(\d{4}[a-z]+)\.tar\.gz/g;
const ALREADY_CURRENT_MESSAGE = "already current";
const OUTPUT_KEY = "release";
const EXIT_CODE_FAILED = 1;

/** The newest release named by a `tzdata<release>.tar.gz` entry of the listing. */
export function findNewestListedRelease(
  listingHtml: string,
): string | undefined {
  const names = [...listingHtml.matchAll(TZDATA_ARCHIVE_PATTERN)].map((match) =>
    String(match[1]),
  );
  return names.reduce<string | undefined>(
    (newest, name) =>
      newest === undefined || compareReleaseNames(name, newest) > 0
        ? name
        : newest,
    undefined,
  );
}

/** The release to compile, or `undefined` when the committed release is current. */
export function findReleaseToPublish(
  listingHtml: string,
  committedRelease: string,
): string | undefined {
  const newest = findNewestListedRelease(listingHtml);
  if (newest === undefined || !isNewerRelease(newest, committedRelease)) {
    return undefined;
  }
  return newest;
}

export type LatestReleaseDependencies = {
  fetchListing: () => Promise<string>;
  readCommittedRelease: () => Promise<string>;
  /** `$GITHUB_OUTPUT`; the release is not written without it. */
  outputFile: string | undefined;
  log: (line: string) => void;
};

export async function runLatestRelease(
  dependencies: LatestReleaseDependencies,
): Promise<number> {
  try {
    const release = findReleaseToPublish(
      await dependencies.fetchListing(),
      await dependencies.readCommittedRelease(),
    );
    if (release === undefined) {
      dependencies.log(ALREADY_CURRENT_MESSAGE);
      return 0;
    }
    if (dependencies.outputFile !== undefined) {
      await appendFile(dependencies.outputFile, `${OUTPUT_KEY}=${release}\n`);
    }
    dependencies.log(release);
    return 0;
  } catch (error) {
    dependencies.log(
      `Finding the latest release failed: ${error instanceof Error ? error.message : String(error)}`,
    );
    return EXIT_CODE_FAILED;
  }
}

// Stryker disable all: the entry point binds the real dependencies; Node smoke runs cover it
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  process.exitCode = await runLatestRelease({
    fetchListing: async () => {
      const response = await fetch(IANA_RELEASES_URL);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status} ${IANA_RELEASES_URL}`);
      }
      return response.text();
    },
    readCommittedRelease: async () =>
      JSON.parse(await readFile(ZONE_RULES_RELEASE_FILE, "utf8")).release,
    outputFile: process.env.GITHUB_OUTPUT,
    log: console.log,
  });
}
// Stryker restore all
