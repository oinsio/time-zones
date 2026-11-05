import { useContext } from "react";
import { DEFAULT_PREFERENCES, type ZoneLabelPart } from "@/preferences";
import { PreferencesContext } from "./preferencesContext";

/**
 * The zone parts the zone line shows. Outside a `PreferencesProvider` (a bare
 * hook under test) it is the default.
 * Implements FR13 of show-zone-abbreviations-and-zone-label-setting (D4).
 */
export function useZoneLabelParts(): readonly ZoneLabelPart[] {
  const context = useContext(PreferencesContext);
  return (context?.preferences ?? DEFAULT_PREFERENCES).zoneLabelParts;
}
