import {
  type ShareDestination,
  ShareDestinationId,
  type TextSharing,
} from "@/ports";

/**
 * The text share destination: hands the meeting share text to the text
 * sharing. Always available, because the clipboard is its fallback.
 * Implements FR9, FR11 of add-meeting-share-dialog (D5).
 */
export const createTextShareDestination = (
  textSharing: TextSharing,
): ShareDestination => ({
  id: ShareDestinationId.TEXT,
  isAvailable: () => true,
  share: ({ text }) => textSharing.shareText(text),
});
