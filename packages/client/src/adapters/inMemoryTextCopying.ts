import { CopyOutcome, type TextCopying } from "@/ports";

export type InMemoryTextCopying = TextCopying & {
  readonly copiedTexts: readonly string[];
};

/**
 * Adapter with a configured answer that records the copied texts, for tests
 * and previews.
 * Implements FR12 of add-unix-time-converter-tool (D10).
 */
export function createInMemoryTextCopying(
  options: { canCopy: boolean } = { canCopy: true },
): InMemoryTextCopying {
  const copiedTexts: string[] = [];
  return {
    copiedTexts,
    async copyText(text) {
      if (!options.canCopy) return CopyOutcome.FAILED;
      copiedTexts.push(text);
      return CopyOutcome.COPIED;
    },
  };
}
