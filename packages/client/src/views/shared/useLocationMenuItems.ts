import { useTranslation } from "react-i18next";
import { LocationMarkKind, type LocationRow } from "@/presenter";
import type { LocationMenuItem } from "./LocationMenu";

/** Where a row stands in its list, which decides the move items that apply. */
export type RowPosition = { rowIndex: number; rowCount: number };

/** How many places a menu move shifts a row. */
export const MENU_MOVE_STEP = 1;

/**
 * The items of a row's location menu: make or clear home, move up, move down,
 * then remove. The move that cannot apply is disabled. Moving by the menu is the
 * keyboard way and the single-pointer alternative to dragging.
 * Implements FR11 of set-home-location-and-show-differences (D7, D8); moved
 * from `LocationRow` to keep it short (FR7 of add-view-mode-setting-and-grid-skeleton).
 * Implements FR16, NFR-A3 of redesign-cards-grid-and-day-palettes (D6): the move items.
 */
export function useLocationMenuItems(
  row: LocationRow,
  { rowIndex, rowCount }: RowPosition,
  onSetHome: (id: string | null) => void,
  onRemove: (id: string) => void,
  onMoveStep: (id: string, step: number) => void,
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
  menuItems.push(
    {
      label: t("locations.moveUp"),
      onSelect: () => onMoveStep(row.id, -MENU_MOVE_STEP),
      isDisabled: rowIndex <= 0,
    },
    {
      label: t("locations.moveDown"),
      onSelect: () => onMoveStep(row.id, MENU_MOVE_STEP),
      isDisabled: rowIndex >= rowCount - 1,
    },
    {
      label: t("locations.remove"),
      onSelect: () => onRemove(row.id),
    },
  );
  return menuItems;
}
