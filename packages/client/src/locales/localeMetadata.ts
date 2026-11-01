/** The `_meta` block of a locale file. Implements FR3, FR9 of add-interface-language-selection (D4). */
export type LocaleMetadata = {
  code: string;
  name: string;
  nativeName: string;
  baseLanguage: string;
  emoji: string;
};

const LOCALE_METADATA_FIELDS = [
  "code",
  "name",
  "nativeName",
  "baseLanguage",
  "emoji",
] as const satisfies readonly (keyof LocaleMetadata)[];

const isNonEmptyString = (value: unknown): value is string =>
  typeof value === "string" && value.length > 0;

const isCanonicalLanguageTag = (code: string): boolean => {
  try {
    return Intl.getCanonicalLocales(code)[0] === code;
  } catch {
    return false;
  }
};

/**
 * Reads locale metadata, or returns `undefined` when a field is missing or empty,
 * the code differs from the file name, or the code is not a canonical language tag.
 *
 * Implements FR9 of add-interface-language-selection (D4).
 */
export const parseLocaleMetadata = (
  meta: unknown,
  fileCode: string,
): LocaleMetadata | undefined => {
  if (typeof meta !== "object" || meta === null) return undefined;
  const fields = meta as Record<string, unknown>;
  if (!LOCALE_METADATA_FIELDS.every((field) => isNonEmptyString(fields[field])))
    return undefined;
  const metadata = meta as LocaleMetadata;
  if (metadata.code !== fileCode || !isCanonicalLanguageTag(metadata.code))
    return undefined;
  return {
    code: metadata.code,
    name: metadata.name,
    nativeName: metadata.nativeName,
    baseLanguage: metadata.baseLanguage,
    emoji: metadata.emoji,
  };
};
