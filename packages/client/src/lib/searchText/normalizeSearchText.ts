/**
 * Text normalization shared by every city search source.
 * Implements FR1 of add-locations-via-search (D7).
 */
const WORD_SEPARATORS = /[\s\-'’./()]+/;
const COMBINING_MARKS = /\p{M}/gu;

/** Lower-cases, strips diacritics (so `ё` becomes `е`) and trims. */
export function normalizeSearchText(text: string): string {
  return text
    .normalize("NFD")
    .replace(COMBINING_MARKS, "")
    .toLowerCase()
    .trim();
}

/** Words of already normalized text; empty pieces are dropped. */
export function splitIntoWords(normalizedText: string): string[] {
  return normalizedText.split(WORD_SEPARATORS).filter((word) => word !== "");
}
