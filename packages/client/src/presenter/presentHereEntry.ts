import type { HereEntry } from "@/model";
import { LocationMarkKind } from "@/model";
import {
  type PresentedLocationMark,
  presentLocationMarks,
} from "./locationMark";
import {
  type LocationRowsContext,
  type PresentedZoneMoment,
  presentZoneMoment,
} from "./presentZoneMoment";

export type PresentedHereEntry = PresentedZoneMoment & {
  cityLabel: string;
  /** The Here mark: icon label and the caption "here". */
  mark: PresentedLocationMark;
  /** "Device time · UTC+5": replaces country and offset of a card. */
  metaLabel: string;
  /** "Almaty, You are here, Device time": the name of the entry's region. */
  accessibleName: string;
};

/**
 * Presents the Here entry: the zone moment of a row plus its mark, meta line
 * and accessible name.
 * Implements FR2, FR3, FR10, NFR-A2 of show-here-entry-for-device-time (D2, D8).
 * Implements FR7, NFR-A2 of add-wall-time-input-with-hint (D7): passes `cityLabel` to the zone part.
 */
export function presentHereEntry(
  hereEntry: HereEntry,
  cityLabel: string,
  context: LocationRowsContext,
): PresentedHereEntry {
  const zoneMoment = presentZoneMoment({ ...hereEntry, cityLabel }, context);
  const mark = presentLocationMarks(context.translate)[LocationMarkKind.HERE];
  return {
    ...zoneMoment,
    cityLabel,
    mark,
    metaLabel: context.translate("locations.deviceTimeMeta", {
      utcOffset: zoneMoment.utcOffsetLabel,
    }),
    accessibleName: context.translate("locations.hereEntryName", {
      city: cityLabel,
      hereMark: mark.accessibleLabel,
    }),
  };
}
