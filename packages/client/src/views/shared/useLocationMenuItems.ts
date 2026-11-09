import { useTranslation } from "react-i18next";
import { LocationMarkKind, type LocationRow } from "@/presenter";
import type { LocationMenuItem } from "./LocationMenu";

/**
 * The items of a row's location menu: make or clear home, then remove.
 * Implements FR11 of set-home-location-and-show-differences (D7, D8); moved
 * from `LocationRow` to keep it short (FR7 of add-view-mode-setting-and-grid-skeleton).
 */
export function useLocationMenuItems(
  row: LocationRow,
  onSetHome: (id: string | null) => void,
  onRemove: (id: string) => void,
): LocationMenuItem[] {
  const { t } = useTranslation();
  const menuItems: LocationMenuItem[] = [];
  // A row without a day track has an unknown zone and cannot be home.
  if (row.mark?.kind === LocationMarkKind.HOME) {
    menuItems.push({
      label: t("locations.clearHome"),
      onSelect: () => onSetHome(null),
    });
  } else if (row.dayTrack) {
    menuItems.push({
      label: t("locations.makeHome"),
      onSelect: () => onSetHome(row.id),
    });
  }
  menuItems.push({
    label: t("locations.remove"),
    onSelect: () => onRemove(row.id),
  });
  return menuItems;
}
