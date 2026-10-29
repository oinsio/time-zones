/**
 * Builds the source of `virtual:legacy-core-js`: one import line per core-js
 * module that `core-js-compat` reports as missing in the oldest supported
 * engine. Pure: no I/O.
 * Implements FR2 of support-legacy-ios-12-safari (D3).
 */
import compatibleModules from "core-js-compat";

export const LEGACY_CORE_JS_TARGET = "ios_saf 12.2";
const CORE_JS_ENTRY = "core-js/stable";
const CORE_JS_MODULE_DIRECTORY = "core-js/modules";

export function buildLegacyCoreJsModules(): string {
  const { list } = compatibleModules({
    targets: LEGACY_CORE_JS_TARGET,
    modules: CORE_JS_ENTRY,
  });
  return list
    .map(
      (moduleName) => `import "${CORE_JS_MODULE_DIRECTORY}/${moduleName}.js";`,
    )
    .join("\n");
}
