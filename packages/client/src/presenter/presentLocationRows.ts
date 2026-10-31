import {
  getLocationMarkKind,
  isDeviceTimeLocation,
  type Location,
} from "@/model";
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
  /** "Device time · UTC+5": replaces country and offset; only the device time location has it. */
  metaLabel?: string;
  /** "Almaty, You are here, Device time": the row's name; only the device time location has it. */
  accessibleName?: string;
};

/**
 * Rows of the location list: city, country name in the interface language and
 * the UTC offset at the given instant. The device time location has the
 * exemplar city of the device zone, a meta line in place of country and
 * offset, and its own accessible name.
 * Implements FR10, UX4 of add-locations-via-search (D9).
 * Implements FR2, FR3, FR5, FR6 of show-utc-offset-on-location-rows (D2).
 * Implements FR1, FR2, FR5 of mark-device-time-zone-in-location-list (D4).
 * Implements FR1, FR4 of match-here-mark-to-design (D2): the row's mark.
 * Implements FR1, FR2, FR6 of show-local-time-and-date-on-location-cards (D3).
 * Implements FR1 of add-time-sliders-to-location-cards (D5): the day track.
 * Implements FR5, FR6, FR7 of set-home-location-and-show-differences (D3-D5).
 * Implements FR7, NFR-A2 of add-wall-time-input-with-hint (D7): passes `cityLabel` to the zone part.
 * Implements FR8, UX3 of add-settings-page-and-device-time-location (D4).
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
    const mark = markKind === undefined ? undefined : marks[markKind];
    const isDeviceTime = isDeviceTimeLocation(location);
    const cityLabel = isDeviceTime
      ? (context.deviceTimeCityLabel ?? location.timeZoneId)
      : location.label;
    const zoneMoment = presentZoneMoment({ ...location, cityLabel }, context);
    return {
      id: location.id,
      cityLabel,
      countryName: presentCountryName(location.countryCode, language),
      mark,
      ...zoneMoment,
      ...(isDeviceTime && {
        metaLabel: translate("locations.deviceTimeMeta", {
          utcOffset: zoneMoment.utcOffsetLabel,
        }),
        accessibleName: translate("locations.deviceTimeName", {
          city: cityLabel,
          hereMark: mark?.accessibleLabel,
        }),
      }),
    };
  });
}
