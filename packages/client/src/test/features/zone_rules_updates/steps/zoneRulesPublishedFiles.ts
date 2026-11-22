/**
 * Serves a published zone rules release to a page in an E2E scenario: the
 * version file one release above the bundled one and a release file, through
 * `page.route`. Implements FR4, FR7 of add-remote-zone-rules-updates.
 */
import { readFileSync } from "node:fs";
import type { Page } from "@playwright/test";
import { Temporal } from "@/lib/temporal";
import { ZONE_RULES_RELEASE_FILE } from "../../../../../app.config";

const JSON_CONTENT_TYPE = "application/json";
const VERSION_FILE_URL_SUFFIX = "/zone-rules/version.json";
const VERSION_FILE_URL_PATTERN = `**${VERSION_FILE_URL_SUFFIX}`;
/** A longer letter sequence follows every shorter one of the same year (FR5). */
const NEWER_RELEASE_SUFFIX = "a";
const ALMATY_ZONE_ID = "Asia/Almaty";
const SECONDS_PER_HOUR = 3600;
const ALMATY_PUBLISHED_UTC_OFFSET_HOURS = 4;
const ALMATY_PUBLISHED_DESIGNATION = "+04";
const ALMATY_PUBLISHED_FUTURE_RULE = "<+04>-4";

type ReleaseDocument = { release: string; zones: Record<string, unknown> };

const readBundledDocument = (): ReleaseDocument =>
  JSON.parse(readFileSync(ZONE_RULES_RELEASE_FILE, "utf8"));

export const readBundledReleaseName = () => readBundledDocument().release;

export const readNewerReleaseName = () =>
  `${readBundledReleaseName()}${NEWER_RELEASE_SUFFIX}`;

/** The bundled release under the newer name, with Almaty moved to UTC+4. */
const buildNewerDocument = (): ReleaseDocument => {
  const bundled = readBundledDocument();
  return {
    ...bundled,
    release: readNewerReleaseName(),
    zones: {
      ...bundled.zones,
      [ALMATY_ZONE_ID]: {
        types: [
          [
            ALMATY_PUBLISHED_UTC_OFFSET_HOURS * SECONDS_PER_HOUR,
            ALMATY_PUBLISHED_DESIGNATION,
            0,
          ],
        ],
        cutoffType: 0,
        changes: [],
        futureRule: ALMATY_PUBLISHED_FUTURE_RULE,
      },
    },
  };
};

/**
 * The version file and the release file of the newer release as the site
 * serves them, for a server of its own (the silent update E2E).
 * Implements FR11 of apply-data-updates-silently (D8).
 */
export function buildNewerReleaseFiles() {
  const release = readNewerReleaseName();
  return {
    release,
    versionFileBody: JSON.stringify({
      release,
      publishedAt: Temporal.Now.instant().toString(),
    }),
    releaseFileBody: JSON.stringify(buildNewerDocument()),
  };
}

/** Makes the site answer a version file and a release file one release above the bundled one. */
export async function publishNewerRelease(page: Page): Promise<string> {
  const { release, versionFileBody, releaseFileBody } =
    buildNewerReleaseFiles();
  await page.route(VERSION_FILE_URL_PATTERN, (route) =>
    route.fulfill({ contentType: JSON_CONTENT_TYPE, body: versionFileBody }),
  );
  await page.route(`**/zone-rules/${release}.json`, (route) =>
    route.fulfill({ contentType: JSON_CONTENT_TYPE, body: releaseFileBody }),
  );
  return release;
}

export type VersionFileRequests = {
  /** Every version file request the page made since counting began. */
  readCount: () => number;
  /** Resolves once the page's current document has made its start-up request. */
  waitForCurrentPageRequest: () => Promise<void>;
};

/**
 * Counts the requests the page makes for the version file, and knows whether
 * the current document has made its own: the start-up check runs after the
 * app mounts, so a count read right after a reload can miss it.
 */
export function countVersionFileRequests(page: Page): VersionFileRequests {
  let requestCount = 0;
  let isRequestedByCurrentPage = false;
  let onCurrentPageRequest = () => {};
  page.on("framenavigated", (frame) => {
    if (frame === page.mainFrame()) isRequestedByCurrentPage = false;
  });
  page.on("request", (request) => {
    if (!request.url().endsWith(VERSION_FILE_URL_SUFFIX)) return;
    requestCount += 1;
    isRequestedByCurrentPage = true;
    onCurrentPageRequest();
  });
  return {
    readCount: () => requestCount,
    waitForCurrentPageRequest: () =>
      isRequestedByCurrentPage
        ? Promise.resolve()
        : new Promise((resolve) => {
            onCurrentPageRequest = resolve;
          }),
  };
}
