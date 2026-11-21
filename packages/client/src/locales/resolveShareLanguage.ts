import { findRegisteredLocale } from "./localeRegistry";

export type ResolvedShareLanguage = {
  language: string;
  /** True when the language is the pinned one; false when it follows the interface language. */
  isPinned: boolean;
};

/**
 * The language a new share dialog opens with: the pinned one when the locale
 * registry has it, otherwise the interface language (an unregistered pin
 * counts as none, ADR-0004).
 * Implements FR5 of add-meeting-share-dialog (D4).
 */
export function resolveShareLanguage(
  shareLanguage: string | null,
  interfaceLanguage: string,
): ResolvedShareLanguage {
  const isPinned =
    shareLanguage !== null && findRegisteredLocale(shareLanguage) !== undefined;
  return {
    language: isPinned ? shareLanguage : interfaceLanguage,
    isPinned,
  };
}
