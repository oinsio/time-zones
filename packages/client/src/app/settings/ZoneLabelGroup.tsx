import { Fragment } from "react";
import { useTranslation } from "react-i18next";
import {
  usePreferences,
  useZoneLabelExample,
  useZoneLabelParts,
} from "@/controller";
import { ZoneLabelPart } from "@/preferences";
import { ZoneLinePartKind } from "@/presenter";
import { SettingsToggleGroup } from "./SettingsToggleGroup";

const ZONE_LABEL_PART_LABEL_KEYS = {
  [ZoneLabelPart.UTC_OFFSET]: "settings.zoneLabelUtcOffset",
  [ZoneLabelPart.ZONE_ABBREVIATION]: "settings.zoneLabelAbbreviation",
} as const;

/**
 * The zone label group: a toggle for the UTC offset and one for the zone
 * abbreviation, with a live example of the zone line under them.
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
      options={Object.values(ZoneLabelPart).map((part) => ({
        value: part,
        label: t(ZONE_LABEL_PART_LABEL_KEYS[part]),
      }))}
      selectedValues={zoneLabelParts}
      onToggle={setZoneLabelPart}
      description={
        <>
          <span className="sr-only">{t("settings.zoneLabelExample")} </span>
          <span data-zone-line className="flex flex-wrap gap-x-2">
            {exampleParts.map((part) => (
              <Fragment key={part.kind}>
                <span
                  className={
                    part.kind === ZoneLinePartKind.PLACE
                      ? undefined
                      : "whitespace-nowrap"
                  }
                >
                  {part.text}
                </span>{" "}
              </Fragment>
            ))}
          </span>
        </>
      }
    />
  );
}
