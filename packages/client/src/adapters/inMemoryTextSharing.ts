import { ShareOutcome, type TextSharing } from "@/ports";

export type InMemoryTextSharingOptions = {
  /** The browser has a system share. */
  canShare: boolean;
  /** The user closes the share sheet. */
  isCancelled?: boolean;
  /** The system share fails for another reason. */
  isShareFailing?: boolean;
  /** The clipboard works. */
  canCopy: boolean;
};

export type InMemoryTextSharing = TextSharing & {
  readonly sharedTexts: readonly string[];
  readonly copiedTexts: readonly string[];
};

/**
 * Adapter with configured answers that records the shared and copied texts,
 * for tests and previews.
 * Implements FR15 of add-grid-meeting-range-and-share (D4).
 */
export function createInMemoryTextSharing(
  options: InMemoryTextSharingOptions,
): InMemoryTextSharing {
  const sharedTexts: string[] = [];
  const copiedTexts: string[] = [];
  return {
    sharedTexts,
    copiedTexts,
    async shareText(text) {
      if (options.canShare) {
        if (options.isCancelled === true) return ShareOutcome.CANCELLED;
        if (options.isShareFailing !== true) {
          sharedTexts.push(text);
          return ShareOutcome.SHARED;
        }
      }
      if (!options.canCopy) return ShareOutcome.FAILED;
      copiedTexts.push(text);
      return ShareOutcome.COPIED;
    },
  };
}
