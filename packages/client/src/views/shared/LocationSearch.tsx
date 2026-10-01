import { type RefObject, useCallback, useRef, useState } from "react";
import { CitySearchStatus, useCitySearch, useLocations } from "@/controller";
import type { LoadCitySearch } from "@/ports";
import type { PresentedSearchResult } from "@/presenter";
import { AddLocationButton } from "./AddLocationButton";
import { LocationSearchDialog } from "./LocationSearchDialog";
import { useSearchShortcut } from "./useSearchShortcut";

type LocationSearchProps = {
  /** Only tests set this; production uses the fetch-based loader. */
  loadCitySearch?: LoadCitySearch;
  /** Receives the trigger; focus returns to it when the search closes. */
  addLocationButtonRef?: RefObject<HTMLButtonElement>;
  onAdded?: (cityName: string) => void;
};

type OpenLocationSearchProps = Required<Pick<LocationSearchProps, "onAdded">> &
  Pick<LocationSearchProps, "loadCitySearch"> & {
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
  const { status, presentResults, retry } = useCitySearch(loadCitySearch);
  const { locations, addLocation } = useLocations();
  const [query, setQuery] = useState("");

  const handleChoose = (result: PresentedSearchResult) => {
    addLocation({
      timeZoneId: result.timeZoneId,
      label: result.cityName,
      countryCode: result.countryCode,
    });
    onAdded(result.cityName);
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
      onRetry={retry}
      onClose={onClose}
      onCloseAutoFocus={onCloseAutoFocus}
    />
  );
}

/**
 * The "Add location" trigger and its search overlay. The search data is
 * requested only once the overlay opens.
 * Implements FR6, FR8, FR15, FR17, NFR-P2, NFR-A2 of add-locations-via-search
 * (D10), and FR1 of open-location-search-with-slash-shortcut (D3).
 */
export function LocationSearch({
  loadCitySearch,
  addLocationButtonRef,
  onAdded = () => undefined,
}: LocationSearchProps) {
  const ownButtonRef = useRef<HTMLButtonElement>(null);
  const buttonRef = addLocationButtonRef ?? ownButtonRef;
  const [isOpen, setIsOpen] = useState(false);
  const openSearch = useCallback(() => setIsOpen(true), []);
  useSearchShortcut({ isEnabled: !isOpen, onShortcut: openSearch });

  const handleCloseAutoFocus = (event: Event) => {
    event.preventDefault();
    buttonRef.current?.focus();
  };

  return (
    <>
      <AddLocationButton ref={buttonRef} onClick={openSearch} />
      {isOpen && (
        <OpenLocationSearch
          loadCitySearch={loadCitySearch}
          onAdded={onAdded}
          onClose={() => setIsOpen(false)}
          onCloseAutoFocus={handleCloseAutoFocus}
        />
      )}
    </>
  );
}
