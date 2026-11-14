import { useContext } from "react";
import {
  type DayColouring,
  DEFAULT_PREFERENCES,
  type WorkingHours,
} from "@/preferences";
import { PreferencesContext } from "./preferencesContext";

/**
 * The day colouring and the working hours. Outside a `PreferencesProvider` (a
 * bare hook under test) they are the defaults.
 * Implements FR2, FR3, FR12 of add-day-colouring-setting (D4).
 */
export function useDayColouring(): {
  dayColouring: DayColouring;
  workingHours: WorkingHours;
} {
  const context = useContext(PreferencesContext);
  const { dayColouring, workingHours } =
    context?.preferences ?? DEFAULT_PREFERENCES;
  return { dayColouring, workingHours };
}
