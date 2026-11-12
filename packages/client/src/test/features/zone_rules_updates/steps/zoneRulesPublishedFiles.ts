/**
 * Serves a published zone rules release to a page in an E2E scenario: the
 * version file one release above the bundled one and a release file, through
 * `page.route`. Implements FR4, FR7 of add-remote-zone-rules-updates.
 */
import { readFileSync } from "node:fs";
import type { Page } from "@playwright/test";
import { ZONE_RULES_RELEASE_FILE } from "../../../../../app.config";

const JSON_CONTENT_TYPE = "application/json";
const VERSION_FILE_URL_PATTERN = "**/zone-rules/version.json";
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

/** Makes the site answer a version file and a release file one release above the bundled one. */
export async function publishNewerRelease(page: Page): Promise<string> {
  const release = readNewerReleaseName();
  await page.route(VERSION_FILE_URL_PATTERN, (route) =>
    route.fulfill({
      contentType: JSON_CONTENT_TYPE,
      body: JSON.stringify({ release, publishedAt: new Date().toISOString() }),
    }),
  );
  await page.route(`**/zone-rules/${release}.json`, (route) =>
    route.fulfill({
      contentType: JSON_CONTENT_TYPE,
      body: JSON.stringify(buildNewerDocument()),
    }),
  );
  return release;
}

/** Counts the requests the page makes for the version file. */
export function countVersionFileRequests(page: Page): () => number {
  let requestCount = 0;
  page.on("request", (request) => {
    if (request.url().endsWith("/zone-rules/version.json")) requestCount += 1;
  });
  return () => requestCount;
}
