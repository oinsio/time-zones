// Verifies NFR-P2 of set-home-location-and-show-differences (D7): the menu adds no dependency.
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const readProjectFile = (relativePath: string) =>
  readFileSync(new URL(relativePath, import.meta.url), "utf8");

const ALLOWED_IMPORT_PATTERN = /^(react|react-i18next|lucide-react|@\/|\.\/)/;
const MENU_PACKAGE_PATTERN = /menu/i;

describe("location menu dependencies", () => {
  it("should not depend on a menu package", () => {
    const manifest = JSON.parse(readProjectFile("../../package.json"));
    const dependencyNames = Object.keys({
      ...manifest.dependencies,
      ...manifest.devDependencies,
    });

    expect(
      dependencyNames.filter((name) => MENU_PACKAGE_PATTERN.test(name)),
    ).toEqual([]);
  });

  it("should import only react, react-i18next, lucide-react and project modules", () => {
    const source = readProjectFile("../views/shared/LocationMenu.tsx");
    const importedModules = [...source.matchAll(/from "([^"]+)"/g)].map(
      (match) => match[1],
    );

    expect(importedModules.length).toBeGreaterThan(0);
    expect(
      importedModules.filter((name) => !ALLOWED_IMPORT_PATTERN.test(name)),
    ).toEqual([]);
  });
});
