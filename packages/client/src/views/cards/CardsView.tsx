import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  LocationsStatus,
  useHereEntry,
  useLocations,
  useTimeSelection,
  useWallTimeInput,
} from "@/controller";
import {
  HereEntryRow,
  LocationList,
  LocationSearch,
  LocationsLoadError,
} from "@/views/shared";

/**
 * Cards view: the location list (or its empty state or load error) and the
 * search that adds locations.
 * Implements FR7, UX1 of add-main-page-scaffold and FR10, FR12, FR17, NFR-A2,
 * NFR-A3 of add-locations-via-search (D10).
 * Implements FR3, FR4 of add-time-sliders-to-location-cards (D8): hands the
 * track selection and move commands to the list.
 * Implements FR3, FR11, NFR-A2 of set-home-location-and-show-differences (D8):
 * announces a home change politely.
 * Implements FR1, FR7, FR9, UX2 of show-here-entry-for-device-time (D5, D6):
 * the Here entry comes first, outside the list, and also in the empty state.
 */
export default function CardsView() {
  const { t } = useTranslation();
  const {
    rows,
    loadStatus,
    removeLocation,
    moveLocation,
    setHomeLocation,
    resetLocations,
  } = useLocations();
  const hereEntry = useHereEntry();
  const { selectTrackFraction, moveTrack } = useTimeSelection();
  const { confirmWallTime } = useWallTimeInput();
  const addLocationButtonRef = useRef<HTMLButtonElement>(null);
  const hasRemovedLastLocation = useRef(false);
  const [announcement, setAnnouncement] = useState("");

  useEffect(() => {
    if (!hasRemovedLastLocation.current || rows.length > 0) return;
    hasRemovedLastLocation.current = false;
    addLocationButtonRef.current?.focus();
  }, [rows]);

  if (loadStatus === LocationsStatus.UNREADABLE) {
    return <LocationsLoadError onReset={resetLocations} />;
  }

  const handleRemove = (id: string) => {
    const removedRow = rows.find((row) => row.id === id);
    hasRemovedLastLocation.current = rows.length === 1;
    removeLocation(id);
    if (removedRow) {
      setAnnouncement(
        t("locations.removedAnnouncement", { city: removedRow.cityLabel }),
      );
    }
  };

  const handleSetHome = (id: string | null) => {
    const outcome = setHomeLocation(id);
    if (!outcome.ok) return;
    const homeRow = rows.find((row) => row.id === id);
    setAnnouncement(
      homeRow
        ? t("locations.homeSetAnnouncement", { city: homeRow.cityLabel })
        : t("locations.homeClearedAnnouncement"),
    );
  };

  const handleAdded = (cityName: string) =>
    setAnnouncement(t("locations.addedAnnouncement", { city: cityName }));

  return (
    <div className="flex flex-col gap-4">
      {hereEntry && (
        <HereEntryRow
          entry={hereEntry}
          onSelectTrackFraction={selectTrackFraction}
          onMoveTrack={moveTrack}
          onConfirmWallTime={confirmWallTime}
        />
      )}
      {rows.length === 0 ? (
        <p className="py-8 text-center text-muted-foreground">
          {t("views.cardsEmptyState")}
        </p>
      ) : (
        <LocationList
          rows={rows}
          onRemove={handleRemove}
          onSetHome={handleSetHome}
          onMove={moveLocation}
          onSelectTrackFraction={selectTrackFraction}
          onMoveTrack={moveTrack}
          onConfirmWallTime={confirmWallTime}
        />
      )}
      <LocationSearch
        addLocationButtonRef={addLocationButtonRef}
        onAdded={handleAdded}
      />
      <p aria-live="polite" aria-atomic="true" className="sr-only">
        {announcement}
      </p>
    </div>
  );
}
