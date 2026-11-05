import type { TFunction } from "i18next";
import type { Temporal } from "@/lib/temporal";
import type { InterfaceLanguageCode } from "@/locales";
import { WallClockStatus } from "@/model";
import type { HourFormat } from "@/preferences";
import { formatWallClockTime } from "./localDateTime";

export type WallTimeHintContext = {
  status: WallClockStatus;
  requestedWallTime: Temporal.PlainTime;
  /** The row's local time at the pinned instant, already presented. */
  shownTimeLabel: string;
  /** The row's UTC offset at the pinned instant, already presented. */
  utcOffsetLabel: string;
  /** The row's zone abbreviation, already presented; empty when the zone has none. */
  zoneAbbreviationLabel: string;
  /** Whether the zone label shows the zone abbreviation. */
  isZoneAbbreviationShown: boolean;
  language: InterfaceLanguageCode;
  hourFormat: HourFormat;
  translate: TFunction;
};

/**
 * The wall-time hint of the row a time was typed in: what a DST gap or a DST
 * overlap did to the typed time. `undefined` for a `UNIQUE` time.
 * Implements FR7, FR11 of add-wall-time-input-with-hint (D4).
 * Implements FR7 of show-zone-abbreviations-and-zone-label-setting (D5): the overlap hint names the zone abbreviation too.
 */
export function presentWallTimeHint({
  status,
  requestedWallTime,
  shownTimeLabel,
  utcOffsetLabel,
  zoneAbbreviationLabel,
  isZoneAbbreviationShown,
  language,
  hourFormat,
  translate,
}: WallTimeHintContext): string | undefined {
  const requestedTime = formatWallClockTime(
    requestedWallTime,
    language,
    hourFormat,
  );
  if (status === WallClockStatus.GAP) {
    return translate("locations.wallTimeHintGap", {
      requestedTime,
      shownTime: shownTimeLabel,
    });
  }
  if (status === WallClockStatus.AMBIGUOUS) {
    return translate("locations.wallTimeHintAmbiguous", {
      requestedTime,
      zone:
        isZoneAbbreviationShown && zoneAbbreviationLabel !== ""
          ? translate("locations.wallTimeHintZone", {
              zoneAbbreviation: zoneAbbreviationLabel,
              utcOffset: utcOffsetLabel,
            })
          : utcOffsetLabel,
    });
  }
  return undefined;
}
