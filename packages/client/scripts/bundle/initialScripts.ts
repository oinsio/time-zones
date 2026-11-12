/**
 * Finds the initial scripts of the entry page: its module script plus its
 * modulepreload links. Used by the bundle budget check.
 */
import { join } from "node:path";
import { APP_BASE_PATH } from "../../app.config.ts";

const ENTRY_SCRIPT_PATTERN = /<script[^>]*type="module"[^>]*src="([^"]+)"/g;
const MODULE_PRELOAD_PATTERN =
  /<link[^>]*rel="modulepreload"[^>]*href="([^"]+)"/g;

export function collectInitialScriptUrls(entryHtml: string): string[] {
  const scriptUrls = [
    ...entryHtml.matchAll(ENTRY_SCRIPT_PATTERN),
    ...entryHtml.matchAll(MODULE_PRELOAD_PATTERN),
  ].flatMap((urlMatch) => (urlMatch[1] === undefined ? [] : [urlMatch[1]]));
  return [...new Set(scriptUrls)];
}

export function resolveBuildFilePath(
  buildDirectory: string,
  scriptUrl: string,
): string {
  const relativePath = scriptUrl.startsWith(APP_BASE_PATH)
    ? scriptUrl.slice(APP_BASE_PATH.length)
    : scriptUrl;
  return join(buildDirectory, relativePath);
}
