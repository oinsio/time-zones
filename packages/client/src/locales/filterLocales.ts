import { normalizeSearchText } from "@/adapters";
import type { RegisteredLocale } from "./localeRegistry";

/**
 * Locales whose native name, English name or code contain the query,
 * compared after search-text normalization. An empty query keeps all.
 *
 * Implements FR6 of add-interface-language-selection.
 */
export const filterLocales = (
  locales: readonly RegisteredLocale[],
  query: string,
): readonly RegisteredLocale[] => {
  const normalizedQuery = normalizeSearchText(query);
  if (normalizedQuery === "") return locales;
  return locales.filter(({ metadata }) =>
    [metadata.nativeName, metadata.name, metadata.code].some((searchable) =>
      normalizeSearchText(searchable).includes(normalizedQuery),
    ),
  );
};
