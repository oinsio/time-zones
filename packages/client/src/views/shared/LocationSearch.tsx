import { useCallback, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { CitySearchStatus, useCitySearch, useLocations } from "@/controller";
import type { LoadCitySearch } from "@/ports";
import type { PresentedSearchResult } from "@/presenter";
import { AddLocationButton } from "./AddLocationButton";
import { LocationSearchDialog } from "./LocationSearchDialog";
import { useSearchShortcut } from "./useSearchShortcut";

type LocationSearchProps = {
  /** Only tests set this; production uses the loader of the `LocationsProvider`. */
  loadCitySearch?: LoadCitySearch;
};

type OpenLocationSearchProps = Pick<LocationSearchProps, "loadCitySearch"> & {
  onAdded: (announcement: string) => void;
  onClose: () => void;
  onCloseAutoFocus: (event: Event) => void;
};

/** The part that owns the search data and exists only while the search is open. */
function OpenLocationSearch({
  loadCitySearch,
  onAdded,
  onClose,
  onCloseAutoFocus,
}: OpenLocationSearchProps) {
  const { t } = useTranslation();
  const {
    locations,
    addLocation,
    addDeviceTimeLocation,
    loadCitySearch: providerLoadCitySearch,
  } = useLocations();
  const { status, presentResults, retry, isDeviceTimeOptionShown } =
    useCitySearch(loadCitySearch ?? providerLoadCitySearch);
  const [query, setQuery] = useState("");

  const handleChoose = (result: PresentedSearchResult) => {
    addLocation({
      timeZoneId: result.timeZoneId,
      label: result.cityName,
      countryCode: result.countryCode,
    });
    onAdded(t("locations.addedAnnouncement", { city: result.cityName }));
    onClose();
  };

  const handleChooseDeviceTime = () => {
    addDeviceTimeLocation();
    onAdded(t("locations.deviceTimeAddedAnnouncement"));
    onClose();
  };

  return (
    <LocationSearchDialog
      isOpen
      status={status}
      presentedResults={
        status === CitySearchStatus.READY
          ? presentResults(query, locations)
          : []
      }
      query={query}
      onQueryChange={setQuery}
      onChoose={handleChoose}
      deviceTimeOption={
        isDeviceTimeOptionShown(query, locations)
          ? {
              label: t("search.deviceTimeOption"),
              onChoose: handleChooseDeviceTime,
            }
          : undefined
      }
      onRetry={retry}
      onClose={onClose}
      onCloseAutoFocus={onCloseAutoFocus}
    />
  );
}

/**
 * The "Add location" trigger and its search overlay, with the polite region
 * that announces an addition. The search data is requested only once the
 * overlay opens.
 * Implements FR6, FR8, FR15, FR17, NFR-P2, NFR-A2 of add-locations-via-search
 * (D10), and FR1 of open-location-search-with-slash-shortcut (D3).
 * Implements FR8 of show-here-entry-for-device-time (D4): the search loads
 * through the loader of the provider, shared with the device time location.
 * Implements FR2, FR11 of add-settings-page-and-device-time-location (D11,
 * D12): lives in the header and owns the "added" announcement.
 */
export function LocationSearch({ loadCitySearch }: LocationSearchProps) {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [announcement, setAnnouncement] = useState("");
  const openSearch = useCallback(() => setIsOpen(true), []);
  useSearchShortcut({ isEnabled: !isOpen, onShortcut: openSearch });

  const handleCloseAutoFocus = (event: Event) => {
    event.preventDefault();
    buttonRef.current?.focus();
  };

  return (
    <>
      <AddLocationButton ref={buttonRef} onClick={openSearch} />
      <p aria-live="polite" aria-atomic="true" className="sr-only">
        {announcement}
      </p>
      {isOpen && (
        <OpenLocationSearch
          loadCitySearch={loadCitySearch}
          onAdded={setAnnouncement}
          onClose={() => setIsOpen(false)}
          onCloseAutoFocus={handleCloseAutoFocus}
        />
      )}
    </>
  );
}
