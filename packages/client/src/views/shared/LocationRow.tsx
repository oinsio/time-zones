import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Navigation, X } from "lucide-react";
import { forwardRef, useId, useRef } from "react";
import { useTranslation } from "react-i18next";
import type { LocationRow as LocationRowModel } from "@/presenter";
import { DragHandle } from "./DragHandle";
import { getReorderTransition } from "./reorderTransition";
import { useDropSettleAnimation } from "./useDropSettleAnimation";

const BADGE_ICON_SIZE_PX = 12;

type LocationRowProps = {
  row: LocationRowModel;
  onRemove: (id: string) => void;
  isReorderable: boolean;
  prefersReducedMotion: boolean;
};

/**
 * One location: move handle, city, country, UTC offset and its remove action.
 * Implements FR10, UX4 of add-locations-via-search (D10).
 * Implements FR1, FR6, UX1 of show-utc-offset-on-location-rows (D5).
 * Implements FR1, FR2, UX1, UX2 of mark-device-time-zone-in-location-list (D5):
 * the device zone badge names the row together with the city.
 * Implements FR1, UX1, UX2 of reorder-locations-by-drag-and-drop (D5): the
 * card itself is translated while dragged, so it keeps its width and slot.
 */
export const LocationRow = forwardRef<HTMLButtonElement, LocationRowProps>(
  function LocationRow(
    { row, onRemove, isReorderable, prefersReducedMotion },
    removeButtonRef,
  ) {
    const { t } = useTranslation();
    const {
      attributes,
      listeners,
      setNodeRef,
      setActivatorNodeRef,
      transform,
      transition,
      isDragging,
      isSorting,
    } = useSortable({
      id: row.id,
      transition: getReorderTransition(prefersReducedMotion),
    });
    const cityId = useId();
    const badgeId = useId();
    const hasDeviceTimeZoneBadge = row.deviceTimeZoneLabel !== "";
    const cardRef = useRef<HTMLLIElement | null>(null);
    const dropSettle = useDropSettleAnimation(
      cardRef,
      isDragging,
      isSorting,
      prefersReducedMotion,
    );
    const hasSecondaryLine =
      row.countryName !== "" || row.utcOffsetLabel !== "";
    const draggingClassName = isDragging ? " relative z-10 shadow-lg" : "";
    return (
      <li
        ref={(element) => {
          cardRef.current = element;
          setNodeRef(element);
        }}
        style={{
          transform: dropSettle.transform ?? CSS.Transform.toString(transform),
          transition: dropSettle.transition ?? transition,
        }}
        onTransitionEnd={dropSettle.onTransitionEnd}
        aria-labelledby={
          hasDeviceTimeZoneBadge ? `${cityId} ${badgeId}` : cityId
        }
        className={`flex items-center gap-3 rounded-md border border-border bg-surface px-4 py-3${draggingClassName}`}
      >
        {isReorderable && (
          <DragHandle
            ref={setActivatorNodeRef}
            city={row.cityLabel}
            attributes={attributes}
            listeners={listeners}
          />
        )}
        <span className="flex flex-1 flex-col">
          <span className="flex flex-wrap items-center gap-x-2">
            <span id={cityId} className="font-semibold">
              {row.cityLabel}
            </span>
            {hasDeviceTimeZoneBadge && (
              <span
                id={badgeId}
                className="inline-flex items-center gap-1 rounded-full bg-accent px-2 text-xs font-medium text-accent-foreground"
              >
                <Navigation aria-hidden="true" size={BADGE_ICON_SIZE_PX} />
                {row.deviceTimeZoneLabel}
              </span>
            )}
          </span>
          {hasSecondaryLine && (
            <span className="flex flex-wrap gap-x-2 text-sm text-muted-foreground">
              {row.countryName !== "" && <span>{row.countryName}</span>}
              {row.utcOffsetLabel !== "" && <span>{row.utcOffsetLabel}</span>}
            </span>
          )}
        </span>
        <button
          ref={removeButtonRef}
          type="button"
          aria-label={t("locations.removeLocation", { city: row.cityLabel })}
          onClick={() => onRemove(row.id)}
          className="flex min-h-11 min-w-11 items-center justify-center rounded-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
        >
          <X aria-hidden="true" />
        </button>
      </li>
    );
  },
);
