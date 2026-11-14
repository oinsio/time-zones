import { BriefcaseBusiness, PaintBucket, SunMoon } from "lucide-react";
import { useTranslation } from "react-i18next";
import { DAY_COLOURING_ORDER } from "@/constants";
import { usePreferences } from "@/controller";
import { DayColouring } from "@/preferences";
import { SettingsOptionGroup } from "./SettingsOptionGroup";

const DAY_COLOURING_ICONS = {
  [DayColouring.PLAIN]: PaintBucket,
  [DayColouring.TIME_OF_DAY]: SunMoon,
  [DayColouring.WORKING_HOURS]: BriefcaseBusiness,
} as const;

const DAY_COLOURING_LABEL_KEYS = {
  [DayColouring.PLAIN]: "settings.dayColouringPlain",
  [DayColouring.TIME_OF_DAY]: "settings.dayColouringTimeOfDay",
  [DayColouring.WORKING_HOURS]: "settings.dayColouringWorkingHours",
} as const;

/**
 * The colouring group of the settings: Plain, Time of day and Working hours
 * as three icons in the option group, after the view group.
 * Implements FR1, FR2, FR3, FR14, UX1 of add-day-colouring-setting (D8).
 */
export function DayColouringGroup() {
  const { t } = useTranslation();
  const { preferences, setDayColouring } = usePreferences();
  return (
    <SettingsOptionGroup
      caption={t("settings.dayColouringLabel")}
      options={DAY_COLOURING_ORDER.map((dayColouring) => ({
        value: dayColouring,
        label: t(DAY_COLOURING_LABEL_KEYS[dayColouring]),
        Icon: DAY_COLOURING_ICONS[dayColouring],
      }))}
      selectedValue={preferences.dayColouring}
      onSelect={setDayColouring}
    />
  );
}
