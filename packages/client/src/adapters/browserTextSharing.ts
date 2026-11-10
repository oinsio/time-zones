import { SHARE_ABORT_ERROR_NAME } from "@/constants";
import { ShareOutcome, type TextSharing } from "@/ports";

/** The parts of `navigator` the adapter uses; each may be missing. */
export type SharingNavigator = {
  share?: (data: { text: string }) => Promise<void>;
  clipboard?: { writeText: (text: string) => Promise<void> };
};

function isShareAbort(rejection: unknown): boolean {
  return (
    typeof rejection === "object" &&
    rejection !== null &&
    "name" in rejection &&
    rejection.name === SHARE_ABORT_ERROR_NAME
  );
}

async function copyText(
  navigatorLike: SharingNavigator,
  text: string,
): Promise<ShareOutcome> {
  try {
    if (navigatorLike.clipboard === undefined) return ShareOutcome.FAILED;
    await navigatorLike.clipboard.writeText(text);
    return ShareOutcome.COPIED;
  } catch {
    return ShareOutcome.FAILED;
  }
}

/**
 * Shares through `navigator.share` where it exists and copies otherwise. A
 * closed share sheet (`AbortError`) is `CANCELLED`; any other share failure
 * falls through to copying.
 * Implements FR15 of add-grid-meeting-range-and-share (D4).
 */
export function createBrowserTextSharing(
  navigatorLike: SharingNavigator,
): TextSharing {
  return {
    async shareText(text) {
      if (navigatorLike.share !== undefined) {
        try {
          await navigatorLike.share({ text });
          return ShareOutcome.SHARED;
        } catch (e) {
          if (isShareAbort(e)) {
            return ShareOutcome.CANCELLED;
          }
        }
      }
      return copyText(navigatorLike, text);
    },
  };
}

/** The sharing of the running browser; `navigator` is read on each call. */
export const browserTextSharing: TextSharing = {
  shareText: (text) => createBrowserTextSharing(navigator).shareText(text),
};
