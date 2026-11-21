import type { MeetingInvitation } from "@/model";
import type { ShareOutcome } from "./textSharing";

/** Where a meeting can be sent; the dialog shows one button per available id. */
export enum ShareDestinationId {
  TEXT = "TEXT",
}

/** What a destination receives: the invitation and the previewed text. */
export type MeetingShare = {
  invitation: MeetingInvitation;
  text: string;
};

/**
 * A place the share dialog can send a meeting to.
 * Implements FR9, FR11 of add-meeting-share-dialog (D5).
 */
export interface ShareDestination {
  id: ShareDestinationId;
  /** Whether this device can use the destination. */
  isAvailable(): boolean;
  /** Implements FR9 of add-meeting-share-dialog. */
  share(meetingShare: MeetingShare): Promise<ShareOutcome>;
}
