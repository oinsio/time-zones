// FR2 of support-legacy-ios-12-safari: core-js modules missing in iOS Safari 12.
import { describe, expect, it } from "vitest";
import {
  buildLegacyCoreJsModules,
  LEGACY_CORE_JS_TARGET,
} from "../../../scripts/legacyCoreJs/buildLegacyCoreJsModules";

describe("buildLegacyCoreJsModules", () => {
  const readImportLines = () => buildLegacyCoreJsModules().split("\n");

  it("should target iOS Safari 12", () => {
    expect(LEGACY_CORE_JS_TARGET).toBe("ios_saf 12.2");
  });

  it.each(["es.array.at", "es.object.has-own"])(
    "should import %s, which iOS 12 lacks",
    (moduleName) => {
      expect(readImportLines()).toContain(
        `import "core-js/modules/${moduleName}.js";`,
      );
    },
  );

  it.each(["es.promise", "es.object.from-entries", "esnext.array.group"])(
    "should skip %s, which iOS 12 has",
    (moduleName) => {
      expect(readImportLines()).not.toContain(
        `import "core-js/modules/${moduleName}.js";`,
      );
    },
  );

  it("should write one import per line and nothing else", () => {
    expect(
      readImportLines().every((line) =>
        /^import "core-js\/modules\/[\w.-]+\.js";$/.test(line),
      ),
    ).toBe(true);
  });
});
