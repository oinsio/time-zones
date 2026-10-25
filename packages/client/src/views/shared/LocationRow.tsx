import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Navigation, X } from "lucide-react";
import { forwardRef, useId, useRef } from "react";
import { useTranslation } from "react-i18next";
import type { TrackMove } from "@/controller";
import type { LocationRow as LocationRowModel } from "@/presenter";
import { DayTrack } from "./DayTrack";
import { DragHandle } from "./DragHandle";
import { LocalDateTime } from "./LocalDateTime";
import { getReorderTransition } from "./reorderTransition";
import { useDropSettleAnimation } from "./useDropSettleAnimation";

const BADGE_ICON_SIZE_PX = 12;

type LocationRowProps = {
  row: LocationRowModel;
  onRemove: (id: string) => void;
  onSelectTrackFraction: (fraction: number) => void;
  onMoveTrack: (move: TrackMove) => void;
  isReorderable: boolean;
  prefersReducedMotion: boolean;
};

/**
 * One location: move handle, city, country, UTC offset and its remove action.
 * Implements FR10, UX4 of add-locations-via-search (D10).
 * Implements FR1, FR6, UX1 of show-utc-offset-on-location-rows (D5).
 * Implements FR1, FR2, UX1, UX2 of mark-device-time-zone-in-location-list (D5):
 * the device zone badge names the row together with the city.
 * Implements FR1, FR2, FR6, UX1, UX2 of show-local-time-and-date-on-location-cards (D5):
 * the time column sits right of the place column.
 * Implements FR1, NFR-R2 of add-time-sliders-to-location-cards (D8): the day
 * track sits under the text below 768 px and right of the time column from it.
 * Implements FR1, UX1, UX2 of reorder-locations-by-drag-and-drop (D5): the
 * card itself is translated while dragged, so it keeps its width and slot.
 */
export const LocationRow = forwardRef<HTMLButtonElement, LocationRowProps>(
  function LocationRow(
    {
      row,
      onRemove,
      onSelectTrackFraction,
      onMoveTrack,
      isReorderable,
      prefersReducedMotion,
    },
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
        className={`flex flex-wrap items-center gap-x-3 gap-y-2 rounded-md border border-border bg-surface px-4 py-3${draggingClassName}`}
      >
        {isReorderable && (
          <DragHandle
            ref={setActivatorNodeRef}
            city={row.cityLabel}
            attributes={attributes}
            listeners={listeners}
          />
        )}
        <span className="flex min-w-0 flex-1 items-start gap-3 md:flex-none">
          <span className="flex min-w-0 flex-1 flex-col break-words md:w-64 md:flex-none">
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
          <LocalDateTime
            localTimeLabel={row.localTimeLabel}
            localDateLabel={row.localDateLabel}
            localIsoDate={row.localIsoDate}
          />
        </span>
        {row.dayTrack && (
          <DayTrack
            track={row.dayTrack}
            city={row.cityLabel}
            onSelectFraction={onSelectTrackFraction}
            onMoveTrack={onMoveTrack}
          />
        )}
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
