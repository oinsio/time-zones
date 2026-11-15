import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  usePreferences,
  useWorkingHoursInput,
  WorkingHoursInputOutcome,
} from "@/controller";
import { DayColouring } from "@/preferences";
import {
  SettingsTimeRangeGroup,
  type TimeRangeInvalidFields,
} from "./SettingsTimeRangeGroup";

const HINT_KEYS: Partial<Record<WorkingHoursInputOutcome, string>> = {
  [WorkingHoursInputOutcome.INVALID_START_TEXT]: "locations.wallTimeInputError",
  [WorkingHoursInputOutcome.INVALID_END_TEXT]: "locations.wallTimeInputError",
  [WorkingHoursInputOutcome.START_NOT_BEFORE_END]:
    "settings.workingHoursOrderError",
};

const INVALID_FIELDS_BY_OUTCOME: Partial<
  Record<WorkingHoursInputOutcome, TimeRangeInvalidFields>
> = {
  [WorkingHoursInputOutcome.INVALID_START_TEXT]: { start: true, end: false },
  [WorkingHoursInputOutcome.INVALID_END_TEXT]: { start: false, end: true },
  [WorkingHoursInputOutcome.START_NOT_BEFORE_END]: { start: true, end: true },
};

/**
 * The working hours row of the settings: shown only in the Working hours
 * colouring, directly under the colouring group. The controller parses and
 * checks the typed texts; this component maps the outcome to a hint. The fields
 * are never remounted, so the focus stays; a change of the stored range or the
 * hour format (from another tab, say) clears the hint and the fields show the
 * new texts.
 * Implements FR4, FR5, FR6, FR7, FR14, UX2, UX3, UX5 of add-day-colouring-setting (D8).
 */
export function WorkingHoursGroup() {
  const { preferences } = usePreferences();
  if (preferences.dayColouring !== DayColouring.WORKING_HOURS) return null;
  return <WorkingHoursRow />;
}

function WorkingHoursRow() {
  const { t } = useTranslation();
  const { preferences } = usePreferences();
  const { startText, endText, confirmWorkingHoursInput } =
    useWorkingHoursInput();
  const [refusal, setRefusal] = useState<
    WorkingHoursInputOutcome | undefined
  >();
  const { workingHours } = preferences;
  const storedKey = `${workingHours.start}|${workingHours.end}|${preferences.hourFormat}`;
  const [seenStoredKey, setSeenStoredKey] = useState(storedKey);
  if (seenStoredKey !== storedKey) {
    setSeenStoredKey(storedKey);
    setRefusal(undefined);
  }
  const hintKey = refusal === undefined ? undefined : HINT_KEYS[refusal];
  return (
    <SettingsTimeRangeGroup
      caption={t("settings.workingHoursLabel")}
      startLabel={t("settings.workingHoursStartLabel")}
      endLabel={t("settings.workingHoursEndLabel")}
      startText={startText}
      endText={endText}
      hint={hintKey === undefined ? undefined : t(hintKey)}
      invalidFields={
        refusal === undefined ? undefined : INVALID_FIELDS_BY_OUTCOME[refusal]
      }
      onConfirm={(typedStart, typedEnd) => {
        const outcome = confirmWorkingHoursInput(typedStart, typedEnd);
        setRefusal(outcome);
        return outcome === WorkingHoursInputOutcome.SAVED;
      }}
      onRestore={() => setRefusal(undefined)}
    />
  );
}
