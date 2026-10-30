/**
 * Assembles the pull request preview site: copies the build unchanged to
 * `<siteDir>/<appDirectory>/` and writes the Netlify `_redirects` and
 * `_headers` files next to it.
 * Usage: node scripts/assemble-preview-site.mjs <distDir> <siteDir>
 * Implements FR2, FR3 of add-pr-preview-deploy (D3).
 */
import { cpSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { APP_BASE_PATH } from "../app.config.ts";
import { buildPreviewSiteFiles } from "./previewSite/buildPreviewSiteFiles.ts";

const USAGE_EXIT_CODE = 2;
const REDIRECTS_FILE_NAME = "_redirects";
const HEADERS_FILE_NAME = "_headers";
const USAGE_TEXT =
  "Usage: node scripts/assemble-preview-site.mjs <distDir> <siteDir>";

const [distDir, siteDir] = process.argv.slice(2);
if (!distDir || !siteDir) {
  console.error(USAGE_TEXT);
  process.exit(USAGE_EXIT_CODE);
}

const { redirects, headers, appDirectory } =
  buildPreviewSiteFiles(APP_BASE_PATH);
mkdirSync(siteDir, { recursive: true });
cpSync(distDir, join(siteDir, appDirectory), { recursive: true });
writeFileSync(join(siteDir, REDIRECTS_FILE_NAME), redirects);
writeFileSync(join(siteDir, HEADERS_FILE_NAME), headers);
