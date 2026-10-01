import type { Announcements, DndContextProps } from "@dnd-kit/core";
import { useRef } from "react";
import { useTranslation } from "react-i18next";
import type { LocationRow } from "@/presenter";

type RowLabel = Pick<LocationRow, "id" | "cityLabel">;

/**
 * Screen-reader instructions and live announcements for moving a card.
 * The first over-event of a drag is the card over its own slot; it is not
 * announced, so the pick-up announcement is not replaced at once.
 * Dropping outside the list is announced as cancelled because the list stays
 * as it was.
 * Implements FR8, NFR-A3, FR3 of reorder-locations-by-drag-and-drop (D5).
 */
export function useReorderAnnouncements(
  rows: readonly RowLabel[],
): NonNullable<DndContextProps["accessibility"]> {
  const { t } = useTranslation();
  const total = rows.length;
  const isAwaitingFirstOver = useRef(false);
  const describe = (
    key: string,
    activeId: string | number,
    positionId: string | number,
  ) => {
    const city = rows.find((row) => row.id === activeId)?.cityLabel;
    const position = rows.findIndex((row) => row.id === positionId) + 1;
    return t(key, { city, position, total });
  };
  const cancelled = (activeId: string | number) =>
    describe("locations.reorderCancelled", activeId, activeId);

  const announcements: Announcements = {
    onDragStart: ({ active }) => {
      isAwaitingFirstOver.current = true;
      return describe("locations.reorderPickedUp", active.id, active.id);
    },
    onDragOver: ({ active, over }) => {
      const isStillInPlace =
        isAwaitingFirstOver.current && over?.id === active.id;
      isAwaitingFirstOver.current = false;
      if (!over || isStillInPlace) return undefined;
      return describe("locations.reorderMovedOver", active.id, over.id);
    },
    onDragEnd: ({ active, over }) =>
      over
        ? describe("locations.reorderDropped", active.id, over.id)
        : cancelled(active.id),
    onDragCancel: ({ active }) => cancelled(active.id),
  };
  return {
    announcements,
    screenReaderInstructions: { draggable: t("locations.reorderInstructions") },
  };
}
