import { getLocationMarkKind, type Location } from "@/model";
import { presentCountryName } from "./countryName";
import {
  type PresentedLocationMark,
  presentLocationMarks,
} from "./locationMark";
import {
  type LocationRowsContext,
  type PresentedZoneMoment,
  presentZoneMoment,
} from "./presentZoneMoment";

export type { LocationRowsContext };

export type LocationRow = PresentedZoneMoment & {
  id: string;
  cityLabel: string;
  countryName: string;
  /** Leading mark of the row ("home" or "here"); `undefined` when the row has none. */
  mark?: PresentedLocationMark;
};

/**
 * Rows of the location list: city, country name in the interface language and
 * the UTC offset at the given instant.
 * Implements FR10, UX4 of add-locations-via-search (D9).
 * Implements FR2, FR3, FR5, FR6 of show-utc-offset-on-location-rows (D2).
 * Implements FR1, FR2, FR5 of mark-device-time-zone-in-location-list (D4).
 * Implements FR1, FR4 of match-here-mark-to-design (D2): the row's mark.
 * Implements FR1, FR2, FR6 of show-local-time-and-date-on-location-cards (D3).
 * Implements FR1 of add-time-sliders-to-location-cards (D5): the day track.
 * Implements FR5, FR6, FR7 of set-home-location-and-show-differences (D3-D5).
 * Implements FR2, FR3 of show-here-entry-for-device-time (D2): the zone part
 * comes from `presentZoneMoment`.
 * Implements FR7, NFR-A2 of add-wall-time-input-with-hint (D7): passes `cityLabel` to the zone part.
 */
export function presentLocationRows(
  locations: readonly Location[],
  context: LocationRowsContext,
): LocationRow[] {
  const { language, translate, deviceTimeZoneId, homeLocationId } = context;
  const marks = presentLocationMarks(translate);
  return locations.map((location) => {
    const markKind = getLocationMarkKind(
      location,
      deviceTimeZoneId,
      homeLocationId,
    );
    return {
      id: location.id,
      cityLabel: location.label,
      countryName: presentCountryName(location.countryCode, language),
      mark: markKind === undefined ? undefined : marks[markKind],
      ...presentZoneMoment({ ...location, cityLabel: location.label }, context),
    };
  });
}
