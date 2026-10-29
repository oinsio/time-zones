import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { forwardRef, useId, useRef } from "react";
import { useTranslation } from "react-i18next";
import type { TrackMove } from "@/controller";
import {
  LocationMarkKind,
  type LocationRow as LocationRowModel,
} from "@/presenter";
import { DayTrack } from "./DayTrack";
import { DragHandle } from "./DragHandle";
import { LocalDateTime } from "./LocalDateTime";
import { LocationMarkIcon } from "./LocationMarkIcon";
import { LocationMenu, type LocationMenuItem } from "./LocationMenu";
import { getReorderTransition } from "./reorderTransition";
import { useDropSettleAnimation } from "./useDropSettleAnimation";

type LocationRowProps = {
  row: LocationRowModel;
  onRemove: (id: string) => void;
  /** `null` clears home. */
  onSetHome: (id: string | null) => void;
  onSelectTrackFraction: (fraction: number) => void;
  onMoveTrack: (move: TrackMove) => void;
  isReorderable: boolean;
  prefersReducedMotion: boolean;
};

/**
 * One location: move handle, city, country, UTC offset and its location menu.
 * Implements FR10, UX4 of add-locations-via-search (D10).
 * Implements FR1, FR6, UX1 of show-utc-offset-on-location-rows (D5).
 * Implements FR1, FR2, UX1, UX2 of mark-device-time-zone-in-location-list (D5):
 * the mark names the row together with the city.
 * Implements FR1, FR2, FR4, UX1, UX2, UX3, NFR-A1 of match-here-mark-to-design (D3):
 * an icon slot before the city and an accent caption after it.
 * Implements FR1, FR2, FR6, UX1, UX2 of show-local-time-and-date-on-location-cards (D5):
 * the time column sits right of the place column.
 * Implements FR1, NFR-R2 of add-time-sliders-to-location-cards (D8): the day
 * track sits under the text below 768 px and right of the time column from it.
 * Implements FR1, UX1, UX2 of reorder-locations-by-drag-and-drop (D5): the
 * card itself is translated while dragged, so it keeps its width and slot.
 * Implements FR5, FR6, FR7, FR11, NFR-A3, UX1, UX2 of
 * set-home-location-and-show-differences (D3, D5, D7, D8): the offset difference
 * after the city, the home mark, and the location menu in place of the
 * remove button.
 */
export const LocationRow = forwardRef<HTMLButtonElement, LocationRowProps>(
  function LocationRow(
    {
      row,
      onRemove,
      onSetHome,
      onSelectTrackFraction,
      onMoveTrack,
      isReorderable,
      prefersReducedMotion,
    },
    menuButtonRef,
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
    const markId = useId();
    const differenceId = useId();
    const cardRef = useRef<HTMLLIElement | null>(null);
    const dropSettle = useDropSettleAnimation(
      cardRef,
      isDragging,
      isSorting,
      prefersReducedMotion,
    );
    const hasSecondaryLine =
      row.countryName !== "" || row.utcOffsetLabel !== "";
    const hasDifference = row.offsetDifferenceLabel !== "";
    const isHome = row.mark?.kind === LocationMarkKind.HOME;
    const menuItems: LocationMenuItem[] = [];
    // A row without a day track has an unknown zone and cannot be home.
    if (isHome) {
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
    const labelIds = [
      cityId,
      row.mark && markId,
      hasDifference && differenceId,
    ];
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
        aria-labelledby={labelIds.filter(Boolean).join(" ")}
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
              {row.mark && <LocationMarkIcon mark={row.mark} id={markId} />}
              <span id={cityId} className="font-semibold">
                {row.cityLabel}
              </span>
              {hasDifference && (
                <>
                  <span
                    aria-hidden="true"
                    data-offset-difference
                    className="text-sm font-semibold text-muted-foreground"
                  >
                    {row.offsetDifferenceLabel}
                  </span>
                  <span
                    id={differenceId}
                    data-offset-difference
                    className="sr-only"
                  >
                    {row.offsetDifferenceAccessibleLabel}
                  </span>
                </>
              )}
              {row.mark?.caption && (
                <span
                  aria-hidden="true"
                  className="text-xs font-bold text-accent"
                >
                  {row.mark.caption}
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
        <LocationMenu
          ref={menuButtonRef}
          city={row.cityLabel}
          items={menuItems}
        />
      </li>
    );
  },
);
