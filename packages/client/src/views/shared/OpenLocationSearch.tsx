import { useState } from "react";
import { useTranslation } from "react-i18next";
import { CitySearchStatus, useCitySearch, useLocations } from "@/controller";
import type { LoadCitySearch } from "@/ports";
import type { PresentedSearchResult } from "@/presenter";
import { LocationSearchDialog } from "./LocationSearchDialog";

export type OpenLocationSearchProps = {
  /** Only tests set this; production uses the loader of the `LocationsProvider`. */
  loadCitySearch?: LoadCitySearch;
  onAdded: (announcement: string) => void;
  onClose: () => void;
  onCloseAutoFocus: (event: Event) => void;
};

/**
 * The part that owns the search data and exists only while the search is open.
 * Loaded on demand (NFR-P1 of add-unix-time-converter-tool, D11).
 */
export function OpenLocationSearch({
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
      coordinates: result.coordinates,
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
