/**
 * Fails when the built JavaScript does not parse at the Safari 12 level, or
 * when the built CSS holds an `inset` shorthand or a `dvh` height without a
 * preceding `vh` fallback. Runs after `pnpm build`; an optional argument names
 * another build directory.
 * Implements FR12, FR13 of support-legacy-ios-12-safari (D9).
 */
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { BUILD_OUT_DIR } from "../app.config.ts";
import {
  findLegacyCssIssues,
  findLegacySyntaxIssues,
} from "./legacyBuild/findLegacySyntaxIssues.ts";

const EXIT_CODE_CHECK_FAILED = 1;
const ASSETS_DIRECTORY = "assets";
const SERVICE_WORKER_FILE = "sw.js";
const WORKBOX_FILE_PATTERN = /^workbox-.*\.js$/;
const SCRIPT_EXTENSION = ".js";
const STYLE_EXTENSION = ".css";

const buildDirectory =
  process.argv[2] ?? join(import.meta.dirname, "..", BUILD_OUT_DIR);

function listFiles(directory) {
  try {
    return readdirSync(directory);
  } catch {
    return [];
  }
}

const assetFiles = listFiles(join(buildDirectory, ASSETS_DIRECTORY)).map(
  (fileName) => join(ASSETS_DIRECTORY, fileName),
);
const rootFiles = listFiles(buildDirectory).filter(
  (fileName) =>
    fileName === SERVICE_WORKER_FILE || WORKBOX_FILE_PATTERN.test(fileName),
);

const issues = [...assetFiles, ...rootFiles].flatMap((relativePath) => {
  const source = readFileSync(join(buildDirectory, relativePath), "utf8");
  if (relativePath.endsWith(SCRIPT_EXTENSION)) {
    return findLegacySyntaxIssues(relativePath, source);
  }
  if (relativePath.endsWith(STYLE_EXTENSION)) {
    return findLegacyCssIssues(relativePath, source);
  }
  return [];
});

if (issues.length === 0) {
  console.log(
    `Legacy build check passed: ${assetFiles.length + rootFiles.length} files.`,
  );
} else {
  for (const { file, construct } of issues) {
    console.error(`${file}: ${construct}`);
  }
  console.error(`Legacy build check failed: ${issues.length} issue(s).`);
  process.exit(EXIT_CODE_CHECK_FAILED);
}
