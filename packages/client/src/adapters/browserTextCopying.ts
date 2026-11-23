import { CopyOutcome, type TextCopying } from "@/ports";

/** The part of `navigator` the adapter uses; it may be missing. */
export type CopyingNavigator = {
  clipboard?: { writeText: (text: string) => Promise<void> };
};

/**
 * Copies through the async clipboard; a missing clipboard or a refusal is
 * `FAILED`. The only owner of the clipboard code (`browserTextSharing` calls it).
 * Implements FR12 of add-unix-time-converter-tool (D10).
 */
export function createBrowserTextCopying(
  navigatorLike: CopyingNavigator,
): TextCopying {
  return {
    async copyText(text) {
      try {
        if (navigatorLike.clipboard === undefined) return CopyOutcome.FAILED;
        await navigatorLike.clipboard.writeText(text);
        return CopyOutcome.COPIED;
      } catch {
        return CopyOutcome.FAILED;
      }
    },
  };
}

/** The copying of the running browser; `navigator` is read on each call. */
export const browserTextCopying: TextCopying = {
  copyText: (text) => createBrowserTextCopying(navigator).copyText(text),
};
