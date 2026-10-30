import { useContext } from "react";
import { DEFAULT_PREFERENCES, type HourFormat } from "@/preferences";
import { PreferencesContext } from "./preferencesContext";

/**
 * The hour format the presenters write times in. Outside a
 * `PreferencesProvider` (a bare hook under test) it is the default.
 * Implements FR5 of add-settings-page-and-device-time-location (D8).
 */
export function useHourFormat(): HourFormat {
  const context = useContext(PreferencesContext);
  return (context?.preferences ?? DEFAULT_PREFERENCES).hourFormat;
}
