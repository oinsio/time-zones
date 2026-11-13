import { useTranslation } from "react-i18next";
import { ZONE_LABEL_PART_ORDER } from "@/constants";
import {
  usePreferences,
  useZoneLabelExample,
  useZoneLabelParts,
} from "@/controller";
import { ZoneLabelPart } from "@/preferences";
import { ZoneLine } from "@/views/shared";
import { SettingsToggleGroup } from "./SettingsToggleGroup";

const ZONE_LABEL_PART_LABEL_KEYS = {
  [ZoneLabelPart.COUNTRY]: "settings.zoneLabelCountry",
  [ZoneLabelPart.UTC_OFFSET]: "settings.zoneLabelUtcOffset",
  [ZoneLabelPart.ZONE_ABBREVIATION]: "settings.zoneLabelAbbreviation",
} as const;

/**
 * The zone label group: a toggle for the country, one for the zone
 * abbreviation and one for the UTC offset, with a live example of the zone line
 * under them; with no part shown the example reads "City only".
 * Implements FR1, FR2, FR5, UX1 of add-country-to-zone-label (D4).
 * Implements FR1, FR2, FR3, FR4, UX1 of polish-settings-and-remove-offline-update-notice (D5).
 * Implements FR12, FR13, FR14, NFR-A1, NFR-R2, UX2 of show-zone-abbreviations-and-zone-label-setting (D7).
 */
export function ZoneLabelGroup() {
  const { t } = useTranslation();
  const { setZoneLabelPart } = usePreferences();
  const zoneLabelParts = useZoneLabelParts();
  const exampleParts = useZoneLabelExample();
  return (
    <SettingsToggleGroup
      caption={t("settings.zoneLabelLabel")}
      options={ZONE_LABEL_PART_ORDER.map((part) => ({
        value: part,
        label: t(ZONE_LABEL_PART_LABEL_KEYS[part]),
      }))}
      selectedValues={zoneLabelParts}
      onToggle={setZoneLabelPart}
      description={
        <>
          <span className="sr-only">{t("settings.zoneLabelExample")} </span>
          {exampleParts.length === 0 ? (
            t("settings.zoneLabelExampleCityOnly")
          ) : (
            <ZoneLine parts={exampleParts} isTextSeparated />
          )}
        </>
      }
    />
  );
}
