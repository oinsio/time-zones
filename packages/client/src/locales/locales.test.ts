// Verifies FR2, FR10 of setup-app-shell-and-pages-deploy: locale files describe
// themselves and share one set of keys.
import { SUPPORTED_LANGUAGES } from "@/i18n";

type LocaleFile = Record<string, unknown> & {
  _meta?: Record<string, unknown>;
};

const LOCALE_FILE_NAME_PATTERN = /\.\/(?<code>[^/]+)\.json$/;
const REQUIRED_META_FIELDS = [
  "code",
  "name",
  "nativeName",
  "baseLanguage",
  "emoji",
];

const localeModules: Record<string, LocaleFile> = import.meta.glob("./*.json", {
  eager: true,
  import: "default",
});

const localeEntries = Object.entries(localeModules).map(
  ([filePath, localeFile]) => ({
    fileCode: filePath.match(LOCALE_FILE_NAME_PATTERN)?.groups?.code,
    localeFile,
  }),
);

const collectKeyPaths = (
  localeNode: Record<string, unknown>,
  parentPath = "",
): string[] =>
  Object.entries(localeNode).flatMap(([key, childNode]) => {
    const keyPath = parentPath ? `${parentPath}.${key}` : key;
    return typeof childNode === "object" && childNode !== null
      ? collectKeyPaths(childNode as Record<string, unknown>, keyPath)
      : [keyPath];
  });

describe("locale files", () => {
  it("should have one locale file per supported language", () => {
    const fileCodes = localeEntries.map(({ fileCode }) => fileCode).sort();
    expect(fileCodes).toEqual([...SUPPORTED_LANGUAGES].sort());
  });

  it.each(localeEntries)(
    "should have _meta.code equal to the file name for $fileCode",
    ({ fileCode, localeFile }) => {
      expect(localeFile._meta?.code).toBe(fileCode);
    },
  );

  it.each(localeEntries)(
    "should have every _meta field filled for $fileCode",
    ({ localeFile }) => {
      for (const metaField of REQUIRED_META_FIELDS) {
        expect(localeFile._meta?.[metaField]).toEqual(expect.any(String));
      }
    },
  );

  it("should have identical key sets in every locale file", () => {
    const [referenceLocale, ...otherLocales] = localeEntries;
    const referenceKeyPaths = collectKeyPaths(
      referenceLocale.localeFile,
    ).sort();
    expect(referenceKeyPaths).toContain("app.title");
    for (const { localeFile } of otherLocales) {
      expect(collectKeyPaths(localeFile).sort()).toEqual(referenceKeyPaths);
    }
  });
});
