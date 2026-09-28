/**
 * Fails the build when the initial JavaScript exceeds the gzipped budget.
 * Initial JavaScript = the entry script of dist/index.html plus its
 * modulepreload links; lazily imported chunks are not counted.
 * Implements NFR-P1, M5 of setup-app-shell-and-pages-deploy (D11).
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { gzipSync } from "node:zlib";
import { APP_BASE_PATH, BUILD_OUT_DIR } from "../app.config.ts";

const INITIAL_JS_BUDGET_KB = 150;
const BYTES_PER_KB = 1024;
const SIZE_FRACTION_DIGITS = 1;
const EXIT_CODE_CHECK_FAILED = 1;
const ENTRY_HTML_FILE = "index.html";

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

if (totalGzippedBytes > budgetBytes) {
  console.error(`${summary} — over budget`);
  process.exit(EXIT_CODE_CHECK_FAILED);
}

console.log(summary);
