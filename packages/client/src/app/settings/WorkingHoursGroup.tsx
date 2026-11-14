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
 * checks the typed texts; this component maps the outcome to a hint. It is
 * keyed by the stored range and the hour format, so a change from another tab
 * or a new hour format resets the texts, and a saved range shows its canonical
 * texts again.
 * Implements FR4, FR5, FR6, FR7, FR14, UX2, UX3, UX5 of add-day-colouring-setting (D8).
 */
export function WorkingHoursGroup() {
  const { preferences } = usePreferences();
  if (preferences.dayColouring !== DayColouring.WORKING_HOURS) return null;
  const { start, end } = preferences.workingHours;
  return <WorkingHoursRow key={`${start}|${end}|${preferences.hourFormat}`} />;
}

function WorkingHoursRow() {
  const { t } = useTranslation();
  const { startText, endText, confirmWorkingHoursInput } =
    useWorkingHoursInput();
  const [refusal, setRefusal] = useState<
    WorkingHoursInputOutcome | undefined
  >();
  const [savedCount, setSavedCount] = useState(0);
  const hintKey = refusal === undefined ? undefined : HINT_KEYS[refusal];
  return (
    <SettingsTimeRangeGroup
      key={savedCount}
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
        if (outcome === WorkingHoursInputOutcome.SAVED) {
          setSavedCount((count) => count + 1);
        }
      }}
      onRestore={() => setRefusal(undefined)}
    />
  );
}
