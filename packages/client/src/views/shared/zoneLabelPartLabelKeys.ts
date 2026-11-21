import { ZoneLabelPart } from "@/preferences";

/**
 * The settings label key of each zone label part, shared by the zone label
 * group of the settings and the share dialog.
 * Implements FR6 of add-meeting-share-dialog.
 */
export const ZONE_LABEL_PART_LABEL_KEYS = {
  [ZoneLabelPart.COUNTRY]: "settings.zoneLabelCountry",
  [ZoneLabelPart.UTC_OFFSET]: "settings.zoneLabelUtcOffset",
  [ZoneLabelPart.ZONE_ABBREVIATION]: "settings.zoneLabelAbbreviation",
} as const;
