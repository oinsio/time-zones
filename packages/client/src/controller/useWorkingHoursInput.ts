import { useCallback } from "react";
import { checkWorkingHours } from "@/preferences";
import {
  getDayPeriodMarkers,
  parseWallTimeInput,
  presentWorkingHoursTexts,
  type WorkingHoursTexts,
} from "@/presenter";
import { useActiveInterfaceLanguage } from "./useActiveInterfaceLanguage";
import { usePreferences } from "./usePreferences";

/** What the view does with the working hours row after a confirmation. */
export enum WorkingHoursInputOutcome {
  /** The hours are stored: the fields show the stored texts. */
  SAVED = "SAVED",
  /** The start text is not a time: the row shows a hint. */
  INVALID_START_TEXT = "INVALID_START_TEXT",
  /** The end text is not a time: the row shows a hint. */
  INVALID_END_TEXT = "INVALID_END_TEXT",
  /** The start is not before the end: the row shows a hint, the last valid hours stay. */
  START_NOT_BEFORE_END = "START_NOT_BEFORE_END",
}

/**
 * The working hours row: the texts of the stored hours in the hour format and
 * the confirmation of typed texts. The controller parses, the view only types.
 * Implements FR5, FR6, FR7 of add-day-colouring-setting (D5).
 */
export function useWorkingHoursInput(): WorkingHoursTexts & {
  confirmWorkingHoursInput: (
    startText: string,
    endText: string,
  ) => WorkingHoursInputOutcome;
} {
  const { preferences, setWorkingHours } = usePreferences();
  const { code: language } = useActiveInterfaceLanguage();
  const { workingHours, hourFormat } = preferences;
  const texts = presentWorkingHoursTexts(workingHours, language, hourFormat);

  const confirmWorkingHoursInput = useCallback(
    (startText: string, endText: string): WorkingHoursInputOutcome => {
      const markers = getDayPeriodMarkers(language);
      const start = parseWallTimeInput(startText, markers);
      if (start === undefined)
        return WorkingHoursInputOutcome.INVALID_START_TEXT;
      const end = parseWallTimeInput(endText, markers);
      if (end === undefined) return WorkingHoursInputOutcome.INVALID_END_TEXT;
      const range = { start, end };
      if (checkWorkingHours(range) !== undefined) {
        return WorkingHoursInputOutcome.START_NOT_BEFORE_END;
      }
      setWorkingHours(range);
      return WorkingHoursInputOutcome.SAVED;
    },
    [language, setWorkingHours],
  );

  return { ...texts, confirmWorkingHoursInput };
}
