import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { forwardRef, useId, useRef } from "react";
import { useTranslation } from "react-i18next";
import {
  type TrackMove,
  type WallTimeInputOutcome,
  type WallTimeTarget,
  WallTimeTargetKind,
} from "@/controller";
import {
  LocationMarkKind,
  type LocationRow as LocationRowModel,
} from "@/presenter";
import { DragHandle } from "./DragHandle";
import { LocationMenu, type LocationMenuItem } from "./LocationMenu";
import { getReorderTransition } from "./reorderTransition";
import { useDropSettleAnimation } from "./useDropSettleAnimation";
import { WallTimeHint } from "./WallTimeHint";
import { ZoneRowContent } from "./ZoneRowContent";

type LocationRowProps = {
  row: LocationRowModel;
  onRemove: (id: string) => void;
  /** `null` clears home. */
  onSetHome: (id: string | null) => void;
  onSelectTrackFraction: (fraction: number) => void;
  onMoveTrack: (move: TrackMove) => void;
  onConfirmWallTime: (
    target: WallTimeTarget,
    text: string,
    date: string,
  ) => WallTimeInputOutcome;
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
 * Implements FR8, UX3 of add-settings-page-and-device-time-location (D4): the
 * device time location shows its meta line and accessible name.
 * Implements FR2, FR4 of show-here-entry-for-device-time (D5): the place
 * column, time and day track live in `ZoneRowContent`.
  * Implements FR1, FR7 of add-wall-time-input-with-hint (D6): binds the location target.
 * Implements FR1, NFR-A2, UX1 of fix-location-card-and-header-layout (D1): the
 * wall-time hint is the last child of the card.
 */
export const LocationRow = forwardRef<HTMLButtonElement, LocationRowProps>(
  function LocationRow(
    {
      row,
      onRemove,
      onSetHome,
      onSelectTrackFraction,
      onMoveTrack,
      onConfirmWallTime,
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
        aria-label={row.accessibleName}
        aria-labelledby={
          row.accessibleName === undefined
            ? labelIds.filter(Boolean).join(" ")
            : undefined
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
        <ZoneRowContent
          cityLabel={row.cityLabel}
          ids={{ city: cityId, mark: markId, difference: differenceId }}
          mark={row.mark}
          offsetDifferenceLabel={row.offsetDifferenceLabel}
          offsetDifferenceAccessibleLabel={row.offsetDifferenceAccessibleLabel}
          secondaryTexts={(row.metaLabel === undefined
            ? [row.countryName, row.utcOffsetLabel]
            : [row.metaLabel]
          ).filter((text) => text !== "")}
          localTimeLabel={row.localTimeLabel}
          localDateLabel={row.localDateLabel}
          localIsoDate={row.localIsoDate}
          wallTimeInputLabel={row.wallTimeInputLabel}
          onConfirmWallTime={(text, date) =>
            onConfirmWallTime(
              { kind: WallTimeTargetKind.LOCATION, locationId: row.id },
              text,
              date,
            )
          }
          dayTrack={row.dayTrack}
          onSelectTrackFraction={onSelectTrackFraction}
          onMoveTrack={onMoveTrack}
        />
        <LocationMenu
          ref={menuButtonRef}
          city={row.cityLabel}
          items={menuItems}
        />
        {row.wallTimeHint !== undefined && (
          <WallTimeHint text={row.wallTimeHint} />
        )}
      </li>
    );
  },
);
