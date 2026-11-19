import type { TFunction } from "i18next";
import { LocationMarkKind } from "@/model";

export type PresentedLocationMark = {
  kind: LocationMarkKind;
  /** Accessible label of the mark icon: "You are here". */
  accessibleLabel: string;
};

type LocationMarkTextKeys = { accessibleLabelKey: string };

/**
 * Text keys of every mark kind; the exhaustive record makes a new kind fail to
 * compile until it has texts.
 * Implements FR3, FR4 of match-here-mark-to-design (D2).
 * Implements FR7 of set-home-location-and-show-differences (D3).
 * Implements FR10 of redesign-cards-grid-and-day-palettes (D7): no mark has a visible caption.
 */
export const LOCATION_MARK_TEXT_KEYS: Record<
  LocationMarkKind,
  LocationMarkTextKeys
> = {
  [LocationMarkKind.HERE]: { accessibleLabelKey: "locations.hereMarkLabel" },
  [LocationMarkKind.HOME]: { accessibleLabelKey: "locations.homeMarkLabel" },
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
    const { accessibleLabelKey } = LOCATION_MARK_TEXT_KEYS[kind];
    marks[kind] = {
      kind,
      accessibleLabel: translate(accessibleLabelKey),
    };
  }
  return marks;
}
