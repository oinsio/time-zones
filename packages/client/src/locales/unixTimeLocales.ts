import type { i18n as I18nInstance } from "i18next";

const LOCALE_FILE_NAME_PATTERN = /\.\/unixTime\/(?<code>[^/]+)\.json$/;
const UNIX_TIME_RESOURCE_KEY = "unixTime";
const TRANSLATION_NAMESPACE = "translation";

// Stryker disable all: Vite reads the glob arguments statically, a mutant switch breaks its parser
/** The texts of the Unix time converter, one file per language, loaded on demand (NFR-P1). */
const unixTimeBundleLoaders: Record<string, () => Promise<unknown>> =
  import.meta.glob("./unixTime/*.json", { import: "default" });
// Stryker restore all

/**
 * Adds the texts of the Unix time converter to the running i18n instance, for
 * every language that has a file: they stay out of the initial JavaScript and
 * load with the converter page, before its first render.
 * Implements FR18, NFR-P1 of add-unix-time-converter-tool (D11).
 */
export async function loadUnixTimeLocales(i18n: I18nInstance): Promise<void> {
  await Promise.all(
    Object.entries(unixTimeBundleLoaders).map(async ([filePath, load]) => {
      const code = LOCALE_FILE_NAME_PATTERN.exec(filePath)?.groups?.code;
      if (code === undefined) return;
      i18n.addResourceBundle(
        code,
        TRANSLATION_NAMESPACE,
        { [UNIX_TIME_RESOURCE_KEY]: await load() },
        true,
        true,
      );
    }),
  );
}
