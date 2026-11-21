import { type LucideIcon, Share2 } from "lucide-react";
import { ShareDestinationId } from "@/ports";

/**
 * The icon of each share destination's button; a `Record`, so a destination
 * without an icon fails the typecheck.
 * Implements FR11, G6 of add-meeting-share-dialog (D5).
 */
export const SHARE_DESTINATION_ICONS: Record<ShareDestinationId, LucideIcon> = {
  [ShareDestinationId.TEXT]: Share2,
};
