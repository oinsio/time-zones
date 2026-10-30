import { useContext } from "react";
import { PreferencesContext } from "./preferencesContext";

export { PreferencesStatus } from "./preferencesContext";

const MISSING_PROVIDER_MESSAGE =
  "usePreferences must be used inside a PreferencesProvider";

/**
 * The preferences with their commands and persistence state.
 * Implements FR4, FR5, FR7 of add-settings-page-and-device-time-location (D5).
 */
export function usePreferences() {
  const context = useContext(PreferencesContext);
  if (context === null) throw new Error(MISSING_PROVIDER_MESSAGE);
  return context;
}
