/**
 * Fails the build when the initial JavaScript exceeds the gzipped budget
 * (NFR-P1 of support-legacy-ios-12-safari: the budget holds with the boot step).
 * Initial JavaScript = the entry script of dist/index.html plus its
 * modulepreload links; lazily imported chunks are not counted.
 * Also fails when a registered view (Cards, Grid) is not a separate chunk,
 * because that chunk is what keeps views out of the initial JavaScript.
 * The search data file must exist as a separate JSON asset within its own
 * gzipped budget and must not be referenced by index.html (no preload).
 * Implements NFR-P1, M5 of setup-app-shell-and-pages-deploy (D11) and NFR-P1,
 * M5 of add-main-page-scaffold; NFR-P2, M7 of add-locations-via-search (D8).
 * Implements NFR-P1 of add-view-mode-setting-and-grid-skeleton: one chunk per view.
 * The zone rules asset must exist within its gzipped budget and be fetched by
 * exactly one preload link, never by a modulepreload.
 * Implements NFR-P1, NFR-P2 of add-zone-rules-from-iana.
 * The served zone rules files (version file and release file) must exist in the
 * build and must not be precached. Implements FR2, NFR-P1 of add-remote-zone-rules-updates.
 */
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { gzipSync } from "node:zlib";
import {
  APP_BASE_PATH,
  BUILD_OUT_DIR,
  ZONE_RULES_ASSET_BUDGET_KB,
} from "../app.config.ts";
import {
  ZONE_RULES_RELEASE_DIRECTORY,
  ZONE_RULES_VERSION_PATH,
} from "../src/constants/zoneRules.ts";
import { findPrecachedZoneRulesFiles } from "./zoneRules/precacheExclusion.ts";

const INITIAL_JS_BUDGET_KB = 150;
const BYTES_PER_KB = 1024;
const SIZE_FRACTION_DIGITS = 1;
const EXIT_CODE_CHECK_FAILED = 1;
const ENTRY_HTML_FILE = "index.html";
const ASSETS_DIRECTORY = "assets";
const VIEW_CHUNK_PREFIXES = ["CardsView-", "GridView-"];
const CITY_SEARCH_DATA_PREFIX = "city-search-";
const CITY_SEARCH_DATA_EXTENSION = ".json";
const CITY_SEARCH_DATA_BUDGET_KB = 30;
const ZONE_RULES_ASSET_PREFIX = "zone-rules-";
const ZONE_RULES_ASSET_EXTENSION = ".json";
const PRELOAD_LINK_PATTERN = /<link[^>]*rel="preload"[^>]*href="([^"]+)"/g;
const EXPECTED_ZONE_RULES_PRELOAD_COUNT = 1;
const SERVICE_WORKER_FILE = "sw.js";
const RELEASE_FILE_PATTERN = /^\d{4}[a-z]+\.json$/;

const ENTRY_SCRIPT_PATTERN = /<script[^>]*type="module"[^>]*src="([^"]+)"/g;
const MODULE_PRELOAD_PATTERN =
  /<link[^>]*rel="modulepreload"[^>]*href="([^"]+)"/g;

const buildDirectory = join(import.meta.dirname, "..", BUILD_OUT_DIR);

function collectInitialScriptUrls(entryHtml) {
  const scriptUrls = [
    ...entryHtml.matchAll(ENTRY_SCRIPT_PATTERN),
    ...entryHtml.matchAll(MODULE_PRELOAD_PATTERN),
  ].map((urlMatch) => urlMatch[1]);
  return [...new Set(scriptUrls)];
}

function resolveBuildFilePath(scriptUrl) {
  const relativePath = scriptUrl.startsWith(APP_BASE_PATH)
    ? scriptUrl.slice(APP_BASE_PATH.length)
    : scriptUrl;
  return join(buildDirectory, relativePath);
}

function getGzippedSizeInBytes(filePath) {
  return gzipSync(readFileSync(filePath)).length;
}

function formatKilobytes(sizeInBytes) {
  return (sizeInBytes / BYTES_PER_KB).toFixed(SIZE_FRACTION_DIGITS);
}

function findMissingViewChunkPrefix() {
  const assetFileNames = readdirSync(join(buildDirectory, ASSETS_DIRECTORY));
  return VIEW_CHUNK_PREFIXES.find(
    (chunkPrefix) =>
      !assetFileNames.some((fileName) => fileName.startsWith(chunkPrefix)),
  );
}

function findCitySearchDataFile() {
  return readdirSync(join(buildDirectory, ASSETS_DIRECTORY)).find(
    (fileName) =>
      fileName.startsWith(CITY_SEARCH_DATA_PREFIX) &&
      fileName.endsWith(CITY_SEARCH_DATA_EXTENSION),
  );
}

function findZoneRulesAssetFile() {
  return readdirSync(join(buildDirectory, ASSETS_DIRECTORY)).find(
    (fileName) =>
      fileName.startsWith(ZONE_RULES_ASSET_PREFIX) &&
      fileName.endsWith(ZONE_RULES_ASSET_EXTENSION),
  );
}

const entryHtml = readFileSync(join(buildDirectory, ENTRY_HTML_FILE), "utf8");
const initialScriptUrls = collectInitialScriptUrls(entryHtml);

let totalGzippedBytes = 0;
for (const scriptUrl of initialScriptUrls) {
  const gzippedBytes = getGzippedSizeInBytes(resolveBuildFilePath(scriptUrl));
  totalGzippedBytes += gzippedBytes;
  console.log(`  ${scriptUrl}: ${formatKilobytes(gzippedBytes)} KB gzipped`);
}

const totalKilobytes = formatKilobytes(totalGzippedBytes);
const budgetBytes = INITIAL_JS_BUDGET_KB * BYTES_PER_KB;
const summary = `Initial JS: ${totalKilobytes} KB gzipped (budget ${INITIAL_JS_BUDGET_KB} KB)`;

if (initialScriptUrls.length === 0) {
  console.error(`No entry script found in ${ENTRY_HTML_FILE}`);
  process.exit(EXIT_CODE_CHECK_FAILED);
}

const missingViewChunkPrefix = findMissingViewChunkPrefix();
if (missingViewChunkPrefix !== undefined) {
  console.error(
    `No separate ${missingViewChunkPrefix}* chunk in ${ASSETS_DIRECTORY}/ — every view must be lazy-loaded`,
  );
  process.exit(EXIT_CODE_CHECK_FAILED);
}

const citySearchDataFile = findCitySearchDataFile();
if (citySearchDataFile === undefined) {
  console.error(
    `No ${CITY_SEARCH_DATA_PREFIX}*${CITY_SEARCH_DATA_EXTENSION} file in ${ASSETS_DIRECTORY}/ — the search data must be a separate file`,
  );
  process.exit(EXIT_CODE_CHECK_FAILED);
}

if (entryHtml.includes(CITY_SEARCH_DATA_PREFIX)) {
  console.error(
    `${ENTRY_HTML_FILE} references ${CITY_SEARCH_DATA_PREFIX}* — the search data must not be preloaded`,
  );
  process.exit(EXIT_CODE_CHECK_FAILED);
}

const citySearchDataBytes = getGzippedSizeInBytes(
  join(buildDirectory, ASSETS_DIRECTORY, citySearchDataFile),
);
if (citySearchDataBytes > CITY_SEARCH_DATA_BUDGET_KB * BYTES_PER_KB) {
  console.error(
    `${citySearchDataFile}: ${formatKilobytes(citySearchDataBytes)} KB gzipped — over the ${CITY_SEARCH_DATA_BUDGET_KB} KB budget`,
  );
  process.exit(EXIT_CODE_CHECK_FAILED);
}

const zoneRulesAssetFile = findZoneRulesAssetFile();
if (zoneRulesAssetFile === undefined) {
  console.error(
    `No ${ZONE_RULES_ASSET_PREFIX}*${ZONE_RULES_ASSET_EXTENSION} file in ${ASSETS_DIRECTORY}/ — the zone rules must be a separate asset`,
  );
  process.exit(EXIT_CODE_CHECK_FAILED);
}

const zoneRulesAssetBytes = getGzippedSizeInBytes(
  join(buildDirectory, ASSETS_DIRECTORY, zoneRulesAssetFile),
);
if (zoneRulesAssetBytes > ZONE_RULES_ASSET_BUDGET_KB * BYTES_PER_KB) {
  console.error(
    `${zoneRulesAssetFile}: ${formatKilobytes(zoneRulesAssetBytes)} KB gzipped — over the ${ZONE_RULES_ASSET_BUDGET_KB} KB budget`,
  );
  process.exit(EXIT_CODE_CHECK_FAILED);
}

const zoneRulesPreloadCount = [
  ...entryHtml.matchAll(PRELOAD_LINK_PATTERN),
].filter((preloadMatch) =>
  preloadMatch[1].includes(ZONE_RULES_ASSET_PREFIX),
).length;
const isZoneRulesModulePreloaded = collectInitialScriptUrls(entryHtml).some(
  (scriptUrl) => scriptUrl.includes(ZONE_RULES_ASSET_PREFIX),
);
if (
  zoneRulesPreloadCount !== EXPECTED_ZONE_RULES_PRELOAD_COUNT ||
  isZoneRulesModulePreloaded
) {
  console.error(
    `${ENTRY_HTML_FILE} must preload ${ZONE_RULES_ASSET_PREFIX}* exactly once and never modulepreload it (found ${zoneRulesPreloadCount} preload links)`,
  );
  process.exit(EXIT_CODE_CHECK_FAILED);
}

const servedReleaseFiles = existsSync(
  join(buildDirectory, ZONE_RULES_RELEASE_DIRECTORY),
)
  ? readdirSync(join(buildDirectory, ZONE_RULES_RELEASE_DIRECTORY)).filter(
      (fileName) => RELEASE_FILE_PATTERN.test(fileName),
    )
  : [];
if (
  !existsSync(join(buildDirectory, ZONE_RULES_VERSION_PATH)) ||
  servedReleaseFiles.length === 0
) {
  console.error(
    `${ZONE_RULES_VERSION_PATH} and a ${ZONE_RULES_RELEASE_DIRECTORY}<release>.json file must be in the build`,
  );
  process.exit(EXIT_CODE_CHECK_FAILED);
}

const precachedZoneRulesFiles = findPrecachedZoneRulesFiles(
  readFileSync(join(buildDirectory, SERVICE_WORKER_FILE), "utf8"),
);
if (precachedZoneRulesFiles.length > 0) {
  console.error(
    `${SERVICE_WORKER_FILE} precaches ${precachedZoneRulesFiles.join(", ")} — the served zone rules files must be fetched fresh`,
  );
  process.exit(EXIT_CODE_CHECK_FAILED);
}

if (totalGzippedBytes > budgetBytes) {
  console.error(`${summary} — over budget`);
  process.exit(EXIT_CODE_CHECK_FAILED);
}

console.log(summary);
console.log(
  `Search data: ${formatKilobytes(citySearchDataBytes)} KB gzipped (budget ${CITY_SEARCH_DATA_BUDGET_KB} KB)`,
);
console.log(
  `Zone rules: ${formatKilobytes(zoneRulesAssetBytes)} KB gzipped (budget ${ZONE_RULES_ASSET_BUDGET_KB} KB)`,
);
