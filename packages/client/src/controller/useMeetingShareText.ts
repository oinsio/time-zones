import type { TFunction } from "i18next";
import { useMemo } from "react";
import {
  type InvitedLocation,
  isDeviceTimeLocation,
  type MeetingInvitation,
} from "@/model";
import type { HourFormat, ZoneLabelPart } from "@/preferences";
import { presentMeetingShareText } from "@/presenter";

type MeetingShareTextInput = {
  invitation: MeetingInvitation | undefined;
  referenceZoneId: string;
  hourFormat: HourFormat;
  shareZoneLabelParts: readonly ZoneLabelPart[];
  shareLanguage: string;
  shareTranslate: TFunction;
  shareCityLabels: ReadonlyMap<string, string> | undefined;
  shareDeviceTimeCity: string | undefined;
};

/**
 * The previewed meeting share text, written in the share language.
 * Implements FR3, FR4, FR6 of add-meeting-share-dialog (D6).
 */
export function useMeetingShareText({
  invitation,
  referenceZoneId,
  hourFormat,
  shareZoneLabelParts,
  shareLanguage,
  shareTranslate,
  shareCityLabels,
  shareDeviceTimeCity,
}: MeetingShareTextInput) {
  return useMemo(() => {
    if (invitation === undefined || invitation.locations.length === 0) {
      return undefined;
    }
    const getCityLabel = (location: InvitedLocation) =>
      isDeviceTimeLocation(location)
        ? (shareDeviceTimeCity ?? location.timeZoneId)
        : (shareCityLabels?.get(location.id) ?? location.label);
    return presentMeetingShareText({
      invitation,
      referenceZoneId,
      hourFormat,
      shareZoneLabelParts,
      language: shareLanguage,
      translate: shareTranslate,
      getCityLabel,
    });
  }, [
    invitation,
    referenceZoneId,
    hourFormat,
    shareZoneLabelParts,
    shareLanguage,
    shareTranslate,
    shareCityLabels,
    shareDeviceTimeCity,
  ]);
}
