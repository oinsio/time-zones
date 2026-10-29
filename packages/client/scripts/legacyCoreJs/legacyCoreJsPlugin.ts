/**
 * Vite plugin serving `virtual:legacy-core-js`, the core-js modules that the
 * oldest supported engine lacks.
 * Implements FR2 of support-legacy-ios-12-safari (D3).
 */
import type { Plugin } from "vite";
import { buildLegacyCoreJsModules } from "./buildLegacyCoreJsModules.ts";

const LEGACY_CORE_JS_MODULE_ID = "virtual:legacy-core-js";
const RESOLVED_ID_PREFIX = "\0";

export function legacyCoreJsPlugin(): Plugin {
  return {
    name: "time-zones-legacy-core-js",
    resolveId(source) {
      return source === LEGACY_CORE_JS_MODULE_ID
        ? `${RESOLVED_ID_PREFIX}${source}`
        : undefined;
    },
    load(resolvedId) {
      return resolvedId === `${RESOLVED_ID_PREFIX}${LEGACY_CORE_JS_MODULE_ID}`
        ? buildLegacyCoreJsModules()
        : undefined;
    },
  };
}
