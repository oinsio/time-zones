import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { LocationsStatus, useLocations } from "@/controller";
import {
  LocationList,
  LocationSearch,
  LocationsLoadError,
} from "@/views/shared";

/**
 * Cards view: the location list (or its empty state or load error) and the
 * search that adds locations.
 * Implements FR7, UX1 of add-main-page-scaffold and FR10, FR12, FR17, NFR-A2,
 * NFR-A3 of add-locations-via-search (D10).
 */
export default function CardsView() {
  const { t } = useTranslation();
  const { rows, loadStatus, removeLocation, resetLocations } = useLocations();
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

  const handleAdded = (cityName: string) =>
    setAnnouncement(t("locations.addedAnnouncement", { city: cityName }));

  return (
    <div className="flex flex-col gap-4">
      {rows.length === 0 ? (
        <p className="py-8 text-center text-muted-foreground">
          {t("views.cardsEmptyState")}
        </p>
      ) : (
        <LocationList rows={rows} onRemove={handleRemove} />
      )}
      <LocationSearch
        addLocationButtonRef={addLocationButtonRef}
        onAdded={handleAdded}
      />
      <p role="status" className="sr-only">
        {announcement}
      </p>
    </div>
  );
}
