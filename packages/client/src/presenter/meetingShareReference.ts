import type { TFunction } from "i18next";

export type MeetingShareReferenceInput = {
  /** The full date of the start in the reference zone. */
  fullDateLabel: string;
  /** The city label of the reference zone. */
  referenceCityLabel: string;
};

/**
 * The reference line under the share dialog's title: the date and the city of
 * the reference zone, in the language of `translate`.
 * Implements FR1 of add-meeting-share-dialog (D6).
 */
export const presentMeetingShareReference = (
  { fullDateLabel, referenceCityLabel }: MeetingShareReferenceInput,
  translate: TFunction,
): string =>
  translate("meeting.shareDialogReference", {
    date: fullDateLabel,
    city: referenceCityLabel,
  });
