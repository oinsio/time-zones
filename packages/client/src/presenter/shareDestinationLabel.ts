import type { TFunction } from "i18next";
import { ShareDestinationId } from "@/ports";

const SHARE_DESTINATION_LABEL_KEYS: Record<ShareDestinationId, string> = {
  [ShareDestinationId.TEXT]: "meeting.shareDialogShare",
};

/**
 * The text of a share destination's button in the language of `translate`.
 * Implements FR11 of add-meeting-share-dialog (D5).
 */
export const presentShareDestinationLabel = (
  destinationId: ShareDestinationId,
  translate: TFunction,
): string => translate(SHARE_DESTINATION_LABEL_KEYS[destinationId]);
