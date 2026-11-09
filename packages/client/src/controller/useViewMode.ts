import { useContext } from "react";
import { DEFAULT_PREFERENCES } from "@/preferences";
import { PreferencesContext } from "./preferencesContext";

/**
 * The id of the view the user chose, `null` when none is chosen. Outside a
 * `PreferencesProvider` (a bare hook under test) it is the default.
 * Implements FR3, FR4 of add-view-mode-setting-and-grid-skeleton (D1).
 */
export function useViewMode(): string | null {
  const context = useContext(PreferencesContext);
  return (context?.preferences ?? DEFAULT_PREFERENCES).viewMode;
}
