import { useContext, useSyncExternalStore } from "react";
import { useTranslation } from "react-i18next";
import { getEffectiveInstant } from "@/model";
import { presentZoneLabelExample, type ZoneLinePart } from "@/presenter";
import { LocationsContext } from "./locationsContext";
import { useActiveInterfaceLanguage } from "./useActiveInterfaceLanguage";
import { useZoneLabelParts } from "./useZoneLabelParts";

const MISSING_PROVIDER_MESSAGE =
  "useZoneLabelExample must be used inside a LocationsProvider";

/**
 * The zone line of the settings example at the effective instant, in the
 * active language, with the zone parts the zone label allows.
 * Implements FR14 of show-zone-abbreviations-and-zone-label-setting (D7).
 */
export function useZoneLabelExample(): ZoneLinePart[] {
  const context = useContext(LocationsContext);
  if (context === null) throw new Error(MISSING_PROVIDER_MESSAGE);
  const { store, clock } = context;
  const state = useSyncExternalStore(store.subscribe, store.getSnapshot);
  const { t } = useTranslation();
  const { code: language } = useActiveInterfaceLanguage();
  const zoneLabelParts = useZoneLabelParts();
  return presentZoneLabelExample({
    instant: getEffectiveInstant(state, clock.instant()),
    language,
    translate: t,
    zoneLabelParts,
  });
}
