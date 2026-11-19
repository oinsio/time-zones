import { useTranslation } from "react-i18next";
import { DAY_PALETTE_ORDER } from "@/constants";
import { usePreferences } from "@/controller";
import { DayColouring, DayPalette } from "@/preferences";
import { PaletteSwatch } from "./PaletteSwatch";
import { SettingsOptionGroup } from "./SettingsOptionGroup";

const DAY_PALETTE_LABEL_KEYS = {
  [DayPalette.VIVID]: "settings.dayPaletteVivid",
  [DayPalette.MUTED]: "settings.dayPaletteMuted",
} as const;

/**
 * The Colours group of the settings: Vivid and Muted as palette swatches in
 * the option group, directly under the colouring group and shown only in the
 * Time of day colouring, in the slot the working hours row uses in Working hours.
 * Implements FR5, UX2, NFR-A3 of redesign-cards-grid-and-day-palettes (D3).
 */
export function DayPaletteGroup() {
  const { t } = useTranslation();
  const { preferences, setDayPalette } = usePreferences();
  if (preferences.dayColouring !== DayColouring.TIME_OF_DAY) return null;
  return (
    <SettingsOptionGroup
      caption={t("settings.dayPaletteLabel")}
      options={DAY_PALETTE_ORDER.map((dayPalette) => ({
        value: dayPalette,
        label: t(DAY_PALETTE_LABEL_KEYS[dayPalette]),
        swatch: <PaletteSwatch dayPalette={dayPalette} />,
      }))}
      selectedValue={preferences.dayPalette}
      onSelect={setDayPalette}
    />
  );
}
