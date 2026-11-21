import type { LocationKind } from "./locationKind";
import type { WorldClockState } from "./locations";
import type { MeetingRange } from "./meetingRange";

/** The stored location fields the meeting share text needs. */
export type InvitedLocation = {
  id: string;
  kind: LocationKind;
  timeZoneId: string;
  label: string;
};

/**
 * The meeting range with the locations it is shared with, in list order. Holds
 * no language and no text.
 */
export type MeetingInvitation = {
  range: MeetingRange;
  locations: readonly InvitedLocation[];
};

/**
 * Which locations a meeting is shared with: the list without the excluded ids,
 * in list order; an excluded id that is not in the list is ignored; none when
 * no meeting range is set.
 * Implements FR3, FR10 of add-meeting-share-dialog (D1).
 */
export function getMeetingInvitation(
  state: Pick<WorldClockState, "locations" | "meeting">,
  excludedLocationIds: readonly string[],
): MeetingInvitation | undefined {
  if (state.meeting === undefined) return undefined;
  return {
    range: state.meeting,
    locations: state.locations
      .filter(({ id }) => !excludedLocationIds.includes(id))
      .map(({ id, kind, timeZoneId, label }) => ({
        id,
        kind,
        timeZoneId,
        label,
      })),
  };
}
