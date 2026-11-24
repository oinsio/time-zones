import type { TFunction } from "i18next";
import { UTC_ZONE_ID } from "@/constants";
import { isDeviceTimeLocation, type Location } from "@/model";
import type { InterfaceLanguageCode } from "@/locales";
import { presentCountryName } from "./countryName";

export type RowHeaderContext = {
  language: InterfaceLanguageCode;
  translate: TFunction;
  /** Exemplar city of the device zone; `undefined` until known. */
  deviceTimeCityLabel?: string;
  /** City label per location id in the interface language; absent until the city data is loaded. */
  cityLabels?: ReadonlyMap<string, string>;
};

export type PresentedRowHeader = {
  isDeviceTime: boolean;
  cityLabel: string;
  countryName: string;
  /** Zone line place: "Device time", the Universal Time label or the country name. */
  placeText: string;
};

/**
 * The one owner of the city label and the zone line's place text of a
 * location, shared by the main page rows and the converter rows.
 * Implements FR9 of add-unix-time-converter-tool.
 */
export function presentRowHeader(
  location: Location,
  context: RowHeaderContext,
): PresentedRowHeader {
  const { language, translate } = context;
  const isDeviceTime = isDeviceTimeLocation(location);
  const isUniversalTime =
    !isDeviceTime &&
    location.timeZoneId === UTC_ZONE_ID &&
    !location.countryCode;
  const cityLabel = isDeviceTime
    ? (context.deviceTimeCityLabel ?? location.timeZoneId)
    : (context.cityLabels?.get(location.id) ?? location.label);
  const countryName = presentCountryName(location.countryCode, language);
  const placeText = isDeviceTime
    ? translate("locations.deviceTimeMeta")
    : isUniversalTime
      ? translate("locations.universalTime")
      : countryName;
  return { isDeviceTime, cityLabel, countryName, placeText };
}
