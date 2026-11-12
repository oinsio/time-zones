import type { TFunction } from "i18next";
import { ZONE_LABEL_EXAMPLE, ZONE_LABEL_PART_ORDER } from "@/constants";
import type { Temporal } from "@/lib/temporal";
import type { InterfaceLanguageCode } from "@/locales";
import {
  getLocalDateTime,
  getUtcOffsetMinutes,
  getZoneAbbreviation,
} from "@/model";
import { ZoneLabelPart } from "@/preferences";
import { presentCountryName } from "./countryName";
import { formatUtcOffset } from "./utcOffset";
import { formatZoneAbbreviation } from "./zoneAbbreviation";

/** What an element of the zone line is; a view styles each kind by it. */
export enum ZoneLinePartKind {
  PLACE = "PLACE",
  ZONE_ABBREVIATION = "ZONE_ABBREVIATION",
  UTC_OFFSET = "UTC_OFFSET",
}

export type ZoneLinePart = { kind: ZoneLinePartKind; text: string };

/** The zone label parts that map to an element after the place. */
const ZONE_LABEL_ZONE_PARTS = ZONE_LABEL_PART_ORDER.filter(
  (part) => part !== ZoneLabelPart.COUNTRY,
) as readonly (ZoneLabelPart.ZONE_ABBREVIATION | ZoneLabelPart.UTC_OFFSET)[];

type ZoneLineInput = {
  /** Country name, or "Device time" on the device time location; may be empty. */
  placeText: string;
  /** The zone abbreviation as written in the interface language; empty when the zone has none. */
  zoneAbbreviationLabel: string;
  /** "UTC+5:30" style label; empty when the offset cannot be computed. */
  utcOffsetLabel: string;
  /** The device time location's "Device time" stays whatever the zone label says. */
  isDeviceTimeMeta: boolean;
  zoneLabelParts: readonly ZoneLabelPart[];
};

/**
 * The elements of a zone line in order, without empty or hidden ones. The
 * zone abbreviation yields to a UTC offset that reads the same (the `UTC` zone).
 * Implements FR5, FR13 of show-zone-abbreviations-and-zone-label-setting (D5).
 * Implements FR3, UX1 of polish-settings-and-remove-offline-update-notice (D5).
 * Implements FR3, FR4 of add-country-to-zone-label (D3).
 */
export function presentZoneLine({
  placeText,
  zoneAbbreviationLabel,
  utcOffsetLabel,
  zoneLabelParts,
  isDeviceTimeMeta,
}: ZoneLineInput): ZoneLinePart[] {
  const isOffsetShown = zoneLabelParts.includes(ZoneLabelPart.UTC_OFFSET);
  const isAbbreviationShown =
    zoneLabelParts.includes(ZoneLabelPart.ZONE_ABBREVIATION) &&
    !(isOffsetShown && zoneAbbreviationLabel === utcOffsetLabel);
  const isPlaceShown =
    isDeviceTimeMeta || zoneLabelParts.includes(ZoneLabelPart.COUNTRY);
  const zonePartByLabelPart = {
    [ZoneLabelPart.ZONE_ABBREVIATION]: {
      kind: ZoneLinePartKind.ZONE_ABBREVIATION,
      text: isAbbreviationShown ? zoneAbbreviationLabel : "",
    },
    [ZoneLabelPart.UTC_OFFSET]: {
      kind: ZoneLinePartKind.UTC_OFFSET,
      text: isOffsetShown ? utcOffsetLabel : "",
    },
  };
  return [
    {
      kind: ZoneLinePartKind.PLACE,
      text: isPlaceShown ? placeText : "",
    },
    ...ZONE_LABEL_ZONE_PARTS.map((part) => zonePartByLabelPart[part]),
  ].filter((part) => part.text !== "");
}

type ZoneLabelExampleContext = {
  instant: Temporal.Instant;
  language: InterfaceLanguageCode;
  translate: TFunction;
  zoneLabelParts: readonly ZoneLabelPart[];
};

/**
 * The zone line of the settings example: `ZONE_LABEL_EXAMPLE` at the
 * effective instant, through the owners the location rows use.
 * Implements FR14 of show-zone-abbreviations-and-zone-label-setting (D5).
 */
export function presentZoneLabelExample({
  instant,
  language,
  translate,
  zoneLabelParts,
}: ZoneLabelExampleContext): ZoneLinePart[] {
  const { timeZoneId, countryCode } = ZONE_LABEL_EXAMPLE;
  const offsetMinutes = getUtcOffsetMinutes(timeZoneId, instant);
  const localDateTime = getLocalDateTime(timeZoneId, instant);
  const abbreviation = localDateTime
    ? getZoneAbbreviation(timeZoneId, localDateTime)
    : undefined;
  return presentZoneLine({
    placeText: presentCountryName(countryCode, language),
    zoneAbbreviationLabel: abbreviation
      ? formatZoneAbbreviation(abbreviation, translate)
      : "",
    utcOffsetLabel:
      offsetMinutes === undefined
        ? ""
        : formatUtcOffset(
            offsetMinutes,
            translate("locations.utcOffsetPrefix"),
          ),
    zoneLabelParts,
    isDeviceTimeMeta: false,
  });
}
