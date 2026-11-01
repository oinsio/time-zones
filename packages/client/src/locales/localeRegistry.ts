import { type LocaleMetadata, parseLocaleMetadata } from "./localeMetadata";

/** Implements FR9 of add-interface-language-selection (D4). */
export type RegisteredLocale = {
  metadata: LocaleMetadata;
  /** The locale file without its `_meta` block. */
  translations: Record<string, unknown>;
};

/** Code of any language the registry may hold. */
export type InterfaceLanguageCode = string;

export const DEFAULT_LANGUAGE: InterfaceLanguageCode = "en";

const LOCALE_FILE_PATH_PATTERN = /^\.\/(?<code>[^/]+)\.json$/;
const LOCALE_METADATA_KEY = "_meta";

const sortByName = new Intl.Collator(DEFAULT_LANGUAGE);

const toRegisteredLocale = (
  filePath: string,
  localeFile: unknown,
): RegisteredLocale | undefined => {
  const fileCode = filePath.match(LOCALE_FILE_PATH_PATTERN)?.groups?.code;
  if (fileCode === undefined) return undefined;
  if (typeof localeFile !== "object" || localeFile === null) return undefined;
  const { [LOCALE_METADATA_KEY]: meta, ...translations } = localeFile as Record<
    string,
    unknown
  >;
  const metadata = parseLocaleMetadata(meta, fileCode);
  return metadata && { metadata, translations };
};

/**
 * Collects the locale files whose metadata is valid, sorted by `name`.
 * `localeModules` is keyed by path, as `import.meta.glob` returns it.
 *
 * Implements FR9 of add-interface-language-selection (D4).
 */
export const buildLocaleRegistry = (
  localeModules: Record<string, unknown>,
): readonly RegisteredLocale[] =>
  Object.entries(localeModules)
    .flatMap(([filePath, localeFile]) => {
      const registeredLocale = toRegisteredLocale(filePath, localeFile);
      return registeredLocale ? [registeredLocale] : [];
    })
    .sort((first, second) =>
      sortByName.compare(first.metadata.name, second.metadata.name),
    );

/** Every locale file of `locales/`, collected automatically. */
export const localeRegistry = buildLocaleRegistry(
  import.meta.glob("./*.json", { eager: true, import: "default" }),
);

export const SUPPORTED_LANGUAGES: readonly InterfaceLanguageCode[] =
  localeRegistry.map(({ metadata }) => metadata.code);

export const findRegisteredLocale = (
  code: string,
  registry: readonly RegisteredLocale[] = localeRegistry,
): RegisteredLocale | undefined =>
  registry.find(({ metadata }) => metadata.code === code);
