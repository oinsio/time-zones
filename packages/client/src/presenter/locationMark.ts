import type { TFunction } from "i18next";
import { LocationMarkKind } from "@/model";

export type PresentedLocationMark = {
  kind: LocationMarkKind;
  /** Accessible label of the mark icon: "You are here". */
  accessibleLabel: string;
  /** Visible caption after the city: "here"; empty when the kind has none. */
  caption: string;
};

type LocationMarkTextKeys = {
  accessibleLabelKey: string;
  captionKey?: string;
};

/**
 * Text keys of every mark kind; the exhaustive record makes a new kind fail to
 * compile until it has texts.
 * Implements FR3, FR4 of match-here-mark-to-design (D2).
 */
export const LOCATION_MARK_TEXT_KEYS: Record<
  LocationMarkKind,
  LocationMarkTextKeys
> = {
  [LocationMarkKind.HERE]: {
    accessibleLabelKey: "locations.hereMarkLabel",
    captionKey: "locations.hereMarkCaption",
  },
};

/**
 * Presented mark of every kind, translated once per call.
 * Implements FR3, FR4 of match-here-mark-to-design (D2).
 */
export function presentLocationMarks(
  translate: TFunction,
): Record<LocationMarkKind, PresentedLocationMark> {
  const marks = {} as Record<LocationMarkKind, PresentedLocationMark>;
  for (const kind of Object.values(LocationMarkKind)) {
    const { accessibleLabelKey, captionKey } = LOCATION_MARK_TEXT_KEYS[kind];
    marks[kind] = {
      kind,
      accessibleLabel: translate(accessibleLabelKey),
      caption: captionKey === undefined ? "" : translate(captionKey),
    };
  }
  return marks;
}
